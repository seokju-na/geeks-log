import { Observable } from 'rxjs';
import { Readable } from 'stream';
import { StorageFile } from './types';

export const STORAGE_TOKEN = 'infra.storage.STORAGE';

export interface UploadFile {
  contentType?: string;
  data: Buffer | Uint8Array | Blob | string | Readable;
}

export interface UploadOptions {
  /** @default true */
  isPublicRead?: boolean;
  cacheControl?: string;
  contentLength?: number;
  expires?: Date;
}

export interface UploadDirectoryOptions {
  pathPrefix?: string;
}

export interface Storage {
  upload(
    bucketName: string,
    path: string,
    file: UploadFile,
    options?: UploadOptions,
  ): Promise<StorageFile | null>;

  uploadDirectory?(
    bucketName: string,
    localDirectory: string,
    options?: UploadDirectoryOptions,
  ): Observable<any>;
}
