import { Test } from '@nestjs/testing';
import { Encryption, EncryptOptions } from './encryption';

describe('utility.Encryption', () => {
  let encryption: Encryption;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [Encryption],
    }).compile();

    encryption = module.get(Encryption);
  });

  test('should encrypt and verify.', async () => {
    const options: EncryptOptions = {
      iteration: 10,
      keySize: 64,
      saltSize: 64,
    };

    const plainText = 'password';
    const { salt, encryptedText } = await encryption.encrypt(plainText, options);

    const isMatched = await encryption.verify(plainText, encryptedText, {
      ...options,
      salt,
    });

    expect(isMatched).toBe(true);
  });
});
