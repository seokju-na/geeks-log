import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Encryption } from '../../utility';
import { Cache, CACHE_TOKEN } from '../cache';
import { AuthService } from './auth-service';
import { UserAuthDummy } from './dummies';

describe('infra.auth.AuthService', () => {
  let mockCache: Cache;
  let authService: AuthService;
  let encryption: Encryption;
  let jwt: JwtService;

  const userAuthDummy = new UserAuthDummy();

  beforeEach(async () => {
    mockCache = new (jest.fn())();
    jwt = new (jest.fn())();

    const module = await Test.createTestingModule({
      providers: [
        { provide: CACHE_TOKEN, useValue: mockCache },
        { provide: JwtService, useValue: jwt },
        AuthService,
        Encryption,
      ],
    }).compile();

    authService = module.get(AuthService);
    encryption = module.get(Encryption);
  });

  describe('#signInWithEmailAndPassword', () => {
    test('should throw error if auth data is not exists in key-value-store.', async () => {
      let error = null;

      mockCache.hgetAll =
        jest.fn().mockImplementationOnce(() => Promise.resolve(null));

      try {
        await authService.signInWithEmailAndPassword(
          'seokju.me@gmail.com',
          'password',
        );
      } catch (err) {
        error = err;
      }

      expect(error).not.toBeNull();
    });

    test('should throw error if password is not valid.', async () => {
      const userAuth = userAuthDummy.create();
      let error = null;

      mockCache.hgetAll = jest.fn().mockImplementationOnce(() => Promise.resolve(userAuth));
      encryption.verify = jest.fn().mockImplementationOnce(() => Promise.resolve(false));

      try {
        await authService.signInWithEmailAndPassword(
          userAuth.email,
          'password',
        );
      } catch (err) {
        error = err;
      }

      expect(encryption.verify).toHaveBeenCalled();
      expect(error).not.toBeNull();
    });

    test('should return token with user auth.', async () => {
      const userAuth = userAuthDummy.create();

      mockCache.hgetAll = jest.fn().mockImplementationOnce(() => Promise.resolve(userAuth));
      encryption.verify = jest.fn().mockImplementationOnce(() => Promise.resolve(true));
      jwt.signAsync = jest.fn().mockImplementationOnce(() => Promise.resolve('token'));

      const tokenWithUserAuth = await authService.signInWithEmailAndPassword(
        userAuth.email,
        'password',
      );

      expect(tokenWithUserAuth.token).toEqual('token');
    });
  });
});
