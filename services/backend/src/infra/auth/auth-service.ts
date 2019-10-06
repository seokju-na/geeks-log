import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import environment from '../../environment';
import { Encryption } from '../../utility';
import { Cache, CACHE_TOKEN } from '../cache';
import { userUnauthorizedException } from './exceptions';
import { JWTPayload, UserAuth } from './types';

type WithToken<T> = T & { token: string };
const encryptOptions = environment.auth.encryptOptions;

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_TOKEN) private readonly cache: Cache,
    private readonly encryption: Encryption,
    private readonly jwtService: JwtService,
  ) {}

  async putLocalUserInfo(userAuth: UserAuth) {
    const key = this.createAuthKeyWithEmail(userAuth.email);
    const pipeline = this.cache.chain();

    for (const [field, value] of Object.entries(userAuth)) {
      pipeline.hset(key, field, value);
    }

    await pipeline.exec();
  }

  async queryLocalUserInfoByEmail(email: string) {
    const key = this.createAuthKeyWithEmail(email);

    return await this.cache.hgetAll<UserAuth>(key);
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    const userAuth = await this.queryLocalUserInfoByEmail(email);

    if (userAuth === null) {
      throw userUnauthorizedException();
    }

    const { encryptedPassword, salt, name } = userAuth;
    const isPasswordValid = await this.encryption.verify(password, encryptedPassword, {
      ...encryptOptions,
      salt: Buffer.from(salt, 'base64'),
    });

    if (!isPasswordValid) {
      throw userUnauthorizedException();
    }

    const payload: JWTPayload = { email, username: name };
    const token = await this.createToken(payload);

    const result: WithToken<UserAuth> = { ...userAuth, token };
    return result;
  }

  async createToken(payload: JWTPayload) {
    return await this.jwtService.signAsync(payload);
  }

  private createAuthKeyWithEmail(email: string) {
    return `auth.emailAndPassword:${email}`;
  }
}
