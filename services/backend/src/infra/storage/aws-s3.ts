import { Provider } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import * as fs from 'fs';
import * as mime from 'mime-types';
import { relative } from 'path';
import { Observable } from 'rxjs';
import { filter, flatMap } from 'rxjs/operators';
import environment from '../../environment';
import { walkDirectory } from 'utility/walk';
import {
  Storage,
  STORAGE_TOKEN,
  UploadDirectoryOptions,
  UploadFile,
  UploadOptions,
} from './storage';
import { StorageFile } from './types';

interface ConstructOptions {
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export class AwsS3 implements Storage {
  private readonly s3: S3;

  constructor({ region, credentials }: ConstructOptions) {
    this.s3 = new S3({
      apiVersion: '2006-03-01',
      region,
      credentials,
    });
  }

  async upload(
    bucketName: string,
    path: string,
    file: UploadFile,
    options?: UploadOptions,
  ): Promise<StorageFile | null> {
    /**
     * You must ensure that you have static or previously resolved credentials to use this method
     * as synchronously.
     */
    const url = this.s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: path,
      ContentType: file.contentType,
    });

    const response = await this.requestUpload(bucketName, path, file, options).toPromise();

    if (!response || !response.ETag) {
      return null;
    }

    return { url };
  }

  uploadDirectory(
    bucketName: string,
    localDirectory: string,
    options: UploadDirectoryOptions = {},
  ) {
    const { pathPrefix } = options;

    return walkDirectory(localDirectory).pipe(
      filter(item => item.stats.isFile()),
      flatMap(item => {
        const itemPath = relative(localDirectory, item.path);
        const pathname = pathPrefix !== undefined ? `${pathPrefix}/${itemPath}` : itemPath;
        const contentType = mime.lookup(pathname);

        return this.requestUpload(bucketName, pathname, {
          contentType: contentType !== false ? contentType : undefined,
          data: fs.createReadStream(item.path),
        });
      }),
    );
  }

  private requestUpload(
    bucketName: string,
    path: string,
    { data, contentType }: UploadFile,
    options?: UploadOptions,
  ) {
    const { isPublicRead, cacheControl, contentLength, expires } = withDefaultUploadOptions(
      options,
    );

    return new Observable<ManagedUpload.SendData>(subscriber => {
      const request = this.s3.upload({
        Bucket: bucketName,
        Key: path,
        Body: data,
        ContentType: contentType,
        ACL: isPublicRead ? 'public-read' : 'private',
        CacheControl: cacheControl,
        ContentLength: contentLength,
        Expires: expires,
      });

      request
        .promise()
        .then(result => {
          subscriber.next(result);
          subscriber.complete();
        })
        .catch(error => {
          subscriber.error(error);
        });

      return () => {
        request.abort();
      };
    });
  }
}

function withDefaultUploadOptions(options?: UploadOptions): UploadOptions {
  return {
    isPublicRead: true,
    ...options,
  };
}

export function provideAwsS3(): Provider {
  return {
    provide: STORAGE_TOKEN,
    useFactory() {
      return new AwsS3({
        region: environment.aws.region,
        credentials: {
          accessKeyId: environment.aws.accessKeyId,
          secretAccessKey: environment.aws.secretAccessKey,
        },
      });
    },
  };
}
