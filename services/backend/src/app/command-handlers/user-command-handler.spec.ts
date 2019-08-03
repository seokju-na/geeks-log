import { EmailDummy } from '@geeks-log/testing';
import { Test } from '@nestjs/testing';
import { Eventstore, EVENTSTORE_TOKEN } from '../../infra/eventstore';
import { Encryption } from '../../utility';
import { AppExceptionCodes } from '../exceptions';
import { AppException } from '../shared/app-exception';
import { UserService } from '../user-service';
import { UserCommandHandler } from './user-command-handler';

describe('app.commandHandlers.UserCommandHandler', () => {
  let userService: UserService;
  let eventstore: Eventstore;

  let commandHandler: UserCommandHandler;

  beforeEach(async () => {
    userService = new (jest.fn());
    eventstore = new (jest.fn());

    const module = await Test.createTestingModule({
      providers: [
        { provide: UserService, useValue: userService },
        { provide: EVENTSTORE_TOKEN, useValue: eventstore },
        Encryption,
        UserCommandHandler,
      ],
    }).compile();

    commandHandler = module.get(UserCommandHandler);
  });

  describe('#handleCreateLocalUserCommand', () => {
    test('should throw "userEmailDuplicatedException" if email is not unique.', async () => {
      let error;
      const email = new EmailDummy().create();

      userService.isUserEmailUnique = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(false));

      try {
        await commandHandler.handleCreateLocalUserCommand({
          email,
          username: 'username',
          password: 'password',
          userAgent: 'userAgent',
        });
      } catch (err) {
        error = err;
      }

      expect(userService.isUserEmailUnique).toHaveBeenCalledWith(email);
      expect((error as AppException).code).toEqual(AppExceptionCodes.USER_EMAIL_DUPLICATED);
    });

    test('should throw "usernameDuplicatedException" if username is not unique.', async () => {
      let error;
      const username = 'username';

      userService.isUserEmailUnique = jest.fn().mockImplementationOnce(() => Promise.resolve(true));
      userService.isUsernameUnique = jest.fn().mockImplementationOnce(() => Promise.resolve(false));

      try {
        await commandHandler.handleCreateLocalUserCommand({
          email: 'seokju.me@gmail.com',
          username,
          password: 'password',
          userAgent: 'userAgent',
        });
      } catch (err) {
        error = err;
      }

      expect(userService.isUsernameUnique).toHaveBeenCalledWith(username);
      expect((error as AppException).code).toEqual(AppExceptionCodes.USER_NAME_DUPLICATED);
    });

    test('should create local user and return user info.', async () => {
      userService.isUserEmailUnique = jest.fn().mockImplementationOnce(() => Promise.resolve(true));
      userService.isUsernameUnique = jest.fn().mockImplementationOnce(() => Promise.resolve(true));
      eventstore.save = jest.fn().mockImplementationOnce(() => Promise.resolve());
      userService.setEmailAndUsername = jest.fn().mockImplementationOnce(() => Promise.resolve());

      const userAuth = await commandHandler.handleCreateLocalUserCommand({
        email: 'seokju.me@gmail.com',
        username: 'username',
        password: 'password',
        userAgent: 'userAgent',
      });

      expect(userService.setEmailAndUsername).toHaveBeenCalledWith('seokju.me@gmail.com', 'username');
      expect(userAuth.id).toBeDefined();
    });
  });
});
