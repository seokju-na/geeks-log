import { Provider } from '@nestjs/common';
import { STORAGE } from '../../infrastructure/storage/injections';
import Storage, { UploadFile, UploadOptions } from '../../infrastructure/storage/Storage';
import StorageFile from '../../infrastructure/storage/StorageFile';
import { matchArguments } from './matches';
import mockPromiseSet from './promises';

const mockUploadName = 'MockStorage#upload';
const mockUploadDirectoryName = 'MockStorage#uploadDirectory';

function getLastCall(mock: jest.Mock) {
  const { calls } = mock.mock;
  return calls[calls.length - 1];
}

export default class MockStorage implements Storage {
  static provide(): Provider {
    return {
      provide: STORAGE,
      useFactory() {
        return new MockStorage();
      },
    };
  }

  private readonly mockUpload = mockPromiseSet.mock(mockUploadName);
  private readonly mockUploadDirectory = mockPromiseSet.mock(mockUploadDirectoryName);

  expectUpload(args: Parameters<typeof MockStorage.prototype.upload>) {
    const lastCall = getLastCall(this.mockUpload);

    if (!matchArguments(lastCall, args)) {
      throw new Error('arguments is not matched');
    }

    return {
      flush(data: StorageFile | null) {
        mockPromiseSet.flush(mockUploadName, data);
      },
      error(error?: Error | string | any) {
        mockPromiseSet.error(error);
      },
    };
  }

  expectUploadDirectory(args: Parameters<typeof MockStorage.prototype.uploadDirectory>) {
    const lastCall = getLastCall(this.mockUploadDirectory);

    if (!matchArguments(lastCall, args)) {
      throw new Error('arguments is not matched');
    }

    return {
      flush() {
        mockPromiseSet.flush(mockUploadDirectoryName);
      },
      error(error?: Error | string | any) {
        mockPromiseSet.error(mockUploadDirectoryName, error);
      },
    };
  }

  clear() {
  }

  upload(
    bucketName: string,
    path: string,
    file: UploadFile,
    options?: UploadOptions,
  ): Promise<StorageFile | null> {
    return this.mockUpload(bucketName, path, file, options);
  }

  uploadDirectory(bucketName: string, path: string, localDirectory: string): Promise<void> {
    return this.mockUploadDirectory(bucketName, path, localDirectory);
  }
}
