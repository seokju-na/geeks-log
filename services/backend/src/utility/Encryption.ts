import { Injectable } from '@nestjs/common';
import { pbkdf2, randomBytes } from 'crypto';
import { promisify } from 'util';

const randomBytesAsync = promisify(randomBytes);
const pbkdf2Async = promisify(pbkdf2);

interface EncryptOptions {
  iteration: number;
  keySize: number;
  saltSize: number;
}

interface VerifyOptions extends Omit<EncryptOptions, 'saltSize'> {
  salt: Buffer;
}

async function createSaltBuffer(size: number): Promise<Buffer> {
  return await randomBytesAsync(size);
}

@Injectable()
export default class Encryption {
  async encrypt(plainText: string, options: EncryptOptions) {
    const { iteration, keySize, saltSize } = options;
    const salt = await createSaltBuffer(saltSize);
    const key = await pbkdf2Async(plainText, salt, iteration, keySize, 'sha512');

    return {
      salt,
      encryptedText: key.toString('base64'),
    };
  }

  async verify(plainText: string, encryptedText: string, options: VerifyOptions) {
    const { salt, iteration, keySize } = options;
    const key = await pbkdf2Async(plainText, salt, iteration, keySize, 'sha512');

    return key.toString('base64') === encryptedText;
  }
}
