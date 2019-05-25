const getUserMock = jest.fn();
const getUserByEmailMock = jest.fn();

class MockFirebaseAuth {
  // noinspection JSUnusedGlobalSymbols
  getUser = getUserMock;
  // noinspection JSUnusedGlobalSymbols
  getUserByEmail = getUserByEmailMock;
}

jest.mock('../third-parties/firebase', () => ({
  __esModule: true,
  default: { auth: () => new MockFirebaseAuth() },
}));

import FirebaseUserRepository from './FirebaseUserRepository';

describe('infrastructure.repositories.FirebaseUserRepository', () => {
  afterEach(jest.clearAllMocks);

  describe('findOneById', () => {
    test('should return user record if user exits.', async () => {
      const user = { uid: 'seokju' };
      getUserMock.mockImplementationOnce(() => Promise.resolve(user));

      const repository = new FirebaseUserRepository();
      const result = await repository.findOneById('userId');

      expect(getUserMock).toHaveBeenCalledWith('userId');
      expect(result).toEqual(user);
    });

    test('should return null if "auth/user-not-found" error caught.', async () => {
      getUserMock.mockImplementationOnce(() => Promise.reject({ code: 'auth/user-not-found' }));

      const repository = new FirebaseUserRepository();
      const result = await repository.findOneById('userId');

      expect(getUserMock).toHaveBeenCalledWith('userId');
      expect(result).toBeNull();
    });
  });

  describe('findOneByEmail', () => {
    test('should return user record if user exits.', async () => {
      const user = { uid: 'seokju' };
      getUserByEmailMock.mockImplementationOnce(() => Promise.resolve(user));

      const repository = new FirebaseUserRepository();
      const result = await repository.findOneByEmail('email');

      expect(getUserByEmailMock).toHaveBeenCalledWith('email');
      expect(result).toEqual(user);
    });

    test('should return null if "auth/user-not-found" error caught.', async () => {
      getUserByEmailMock
        .mockImplementationOnce(() => Promise.reject({ code: 'auth/user-not-found' }));

      const repository = new FirebaseUserRepository();
      const result = await repository.findOneByEmail('email');

      expect(getUserByEmailMock).toHaveBeenCalledWith('email');
      expect(result).toBeNull();
    });
  });
});
