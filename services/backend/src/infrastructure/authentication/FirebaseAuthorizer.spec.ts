const verifyIdTokenMock = jest.fn();
class MockFirebaseAuth {
  // noinspection JSUnusedGlobalSymbols
  verifyIdToken = verifyIdTokenMock;
}

jest.mock('../third-parties/firebase', () => ({
  __esModule: true,
  default: {
    auth: () => new MockFirebaseAuth(),
  },
}));

import FirebaseAuthorizer from './FirebaseAuthorizer';

describe('infrastructure.authentication.FirebaseAuthorizer', () => {
  afterEach(jest.clearAllMocks);

  describe('authenticate', () => {
    test('should verify token and return claims.', async () => {
      const claims = { sub: 'seokju' };
      verifyIdTokenMock.mockImplementationOnce(() => Promise.resolve(claims));

      const authorizer = new FirebaseAuthorizer();
      const result = await authorizer.authenticate('token');

      expect(verifyIdTokenMock).toHaveBeenCalledWith('token');
      expect(result).toEqual(claims);
    });

    test('should return null if verify token fails.', async () => {
      verifyIdTokenMock.mockImplementationOnce(() => Promise.reject('cannot verify.'));

      const authorizer = new FirebaseAuthorizer();
      const result = await authorizer.authenticate('token');

      expect(verifyIdTokenMock).toHaveBeenCalledWith('token');
      expect(result).toBeNull();
    });
  });
});
