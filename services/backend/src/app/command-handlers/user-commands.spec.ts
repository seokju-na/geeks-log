import { EmailDummy } from '@geeks-log/testing';
import { Test } from '@nestjs/testing';
import { CreateLocalUserCommand } from '../../domain/user/commands';
import { Eventstore, EVENTSTORE_TOKEN } from '../../infra/eventstore';
import { Encryption } from '../../utility';
import { AppExceptionCodes } from '../exceptions';
import { AppException } from '../shared/app-exception';
import { UserService } from '../user-service';
import { UserCommands } from './user-commands';

describe('app.commandHandlers.UserCommands', () => {
  let userService: UserService;
  let eventstore: Eventstore;

  let commandHandler: UserCommands;

  beforeEach(async () => {
    userService = new (jest.fn());
    eventstore = new (jest.fn());

    const module = await Test.createTestingModule({
      providers: [
        { provide: UserService, useValue: userService },
        { provide: EVENTSTORE_TOKEN, useValue: eventstore },
        Encryption,
        UserCommands,
      ],
    }).compile();

    commandHandler = module.get(UserCommands);
  });

  describe('#handleCreateLocalUserCommand', () => {
    test('should throw "userEmailDuplicatedException" if email is not unique.', async () => {
      let error;
      const email = new EmailDummy().create();

      userService.isUserEmailUnique = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(false));

      try {
        const command = new CreateLocalUserCommand({
          email,
          username: 'username',
          encryptedPassword: 'password',
          salt: 'salt',
          userAgent: 'userAgent',
        });

        await commandHandler.handleCreateLocalUserCommand(command);
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
        const command = new CreateLocalUserCommand({
          email: 'seokju.me@gmail.com',
          username,
          encryptedPassword: 'password',
          salt: 'salt',
          userAgent: 'userAgent',
        });

        await commandHandler.handleCreateLocalUserCommand(command);
      } catch (err) {
        error = err;
      }

      expect(userService.isUsernameUnique).toHaveBeenCalledWith(username);
      expect((error as AppException).code).toEqual(AppExceptionCodes.USER_NAME_DUPLICATED);
    });
  });
});
