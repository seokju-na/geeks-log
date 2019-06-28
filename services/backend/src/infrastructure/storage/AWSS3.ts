import { S3 } from 'aws-sdk';
import environment from '../../environment';
import RxChildProcess from '../../utility/RxChildProcess';
import toPromise from '../../utility/toPromise';
import Storage, { UploadFile, UploadOptions } from './Storage';
import StorageFile from './StorageFile';

export default class AWSS3 implements Storage {
  private readonly s3 = new S3({
    apiVersion: '2006-03-01',
    region: environment.AWS_REGION,
    credentials: {
      accessKeyId: environment.AWS_KEY,
      secretAccessKey: environment.AWS_SECRET,
    },
  });

  constructor(private rxChildProcess: RxChildProcess) {
  }

  async upload(
    bucketName: string,
    path: string,
    { contentType, data }: UploadFile,
    options?: UploadOptions,
  ): Promise<StorageFile | null> {
    const {
      isPublicRead,
      cacheControl,
      contentLength,
      expires,
    } = withDefaultUploadOptions(options);

    /**
     * You must ensure that you have static or previously resolved credentials to use this method
     * as synchronously.
     */
    const url = this.s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: path,
      ContentType: contentType,
    });

    const response = await this.s3.upload({
      Bucket: bucketName,
      Key: path,
      Body: data,
      ContentType: contentType,
      ACL: isPublicRead ? 'public-read' : 'private',
      CacheControl: cacheControl,
      ContentLength: contentLength,
      Expires: expires,
    }).promise();

    if (!response || !response.ETag) {
      return null;
    }

    return { url };
  }

  uploadDirectory(bucketName: string, path: string, localDirectory: string): Promise<void> {
    // Command is like: aws s3 sync ./www/ s3://example-bucket/some-path/
    return toPromise(this.rxChildProcess.fromSpawn(
      'aws',
      ['s3', 'sync', localDirectory, `s3://${bucketName}/${path}/`],
      {
        cwd: localDirectory,
      },
    ));
  }
}

function withDefaultUploadOptions(options?: UploadOptions): UploadOptions {
  return {
    isPublicRead: true,
    ...options,
  };
}
