import { Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_TOKEN } from '../infra/cache';

const EMAIL_MAP_KEY = 'user_email_map';
const USERNAME_MAP_KEY = 'username_map';

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_TOKEN) private readonly cache: Cache,
  ) {
  }

  async isUserEmailUnique(email: string) {
    return await this.cache.hget(EMAIL_MAP_KEY, email) !== '1';
  }

  async isUsernameUnique(username: string) {
    return await this.cache.hget(USERNAME_MAP_KEY, username) !== '1';
  }

  async setEmailAndUsername(email: string, username: string) {
    await this.cache.chain()
      .hset(EMAIL_MAP_KEY, email, '1')
      .hset(USERNAME_MAP_KEY, username, '1')
      .exec();
  }

  async changeUserEmail(
    previousEmail: string,
    nextEmail: string,
  ) {
    await this.cache.chain()
      .hset(EMAIL_MAP_KEY, previousEmail, '0')
      .hset(EMAIL_MAP_KEY, nextEmail, '1')
      .exec();
  }
}
