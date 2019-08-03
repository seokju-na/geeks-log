import { Injectable } from '@nestjs/common';
import { pbkdf2, randomBytes } from 'crypto';
import { promisify } from 'util';
import environment from '../environment';

const randomBytesAsync = promisify(randomBytes);
const pbkdf2Async = promisify(pbkdf2);

const algorithm = environment.isProduction ? 'sha512' : null;

export interface EncryptOptions {
  iteration: number;
  keySize: number;
  saltSize: number;
}

// NOTE: 'Omit' is supported in typescript 3.5
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

interface VerifyOptions extends Omit<EncryptOptions, 'saltSize'> {
  salt: Buffer;
}

async function createSaltBuffer(size: number): Promise<Buffer> {
  return await randomBytesAsync(size);
}

@Injectable()
export class Encryption {
  async encrypt(plainText: string, options: EncryptOptions) {
    const { iteration, keySize, saltSize } = options;
    const salt = await createSaltBuffer(saltSize);
    const key = await pbkdf2Async(plainText, salt, iteration, keySize, algorithm);

    return {
      salt,
      encryptedText: key.toString('base64'),
    };
  }

  async verify(plainText: string, encryptedText: string, options: VerifyOptions) {
    const { salt, iteration, keySize } = options;
    const key = await pbkdf2Async(plainText, salt, iteration, keySize, algorithm);

    return key.toString('base64') === encryptedText;
  }
}
