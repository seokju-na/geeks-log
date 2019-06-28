import { Readable } from 'stream';
import StorageFile from './StorageFile';

export interface UploadFile {
  contentType: string;
  data: Buffer | Uint8Array | Blob | string | Readable;
}

export interface UploadOptions {
  /** @default true */
  isPublicRead?: boolean;
  cacheControl?: string;
  contentLength?: number;
  expires?: Date;
}

export default interface Storage {
  upload(
    bucketName: string,
    path: string,
    file: UploadFile,
    options?: UploadOptions,
  ): Promise<StorageFile | null>;

  uploadDirectory(
    bucketName: string,
    path: string,
    localDirectory: string,
  ): Promise<void>;
}
