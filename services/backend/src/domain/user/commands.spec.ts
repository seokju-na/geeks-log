import {
  createLocalUserCommand,
  execUserLoginCommand,
  userLoginCommand,
  execCreateLocalUserCommand,
} from './commands';
import { localUserCreatedEvent, userLoggedInEvent } from './events';

describe('domain.user.commands', () => {
  describe('userLoginCommand', () => {
    test('should returns [userLoggedInEvent]', () => {
      const userAgent = 'some user agent';
      const command = userLoginCommand({ id: '1', userAgent });
      const [event] = execUserLoginCommand(command);

      expect(event.type).toEqual(userLoggedInEvent.type);
      expect(event.userAgent).toEqual(userAgent);
      expect(event.timestamp).toBeValidDateStr();
    });
  });

  describe('createLocalUserCommand', () => {
    test('should returns [localUserCreatedEvent, userLoggedInEvent]', () => {
      const command = createLocalUserCommand({
        email: 'seokju.me@gmail.com',
        username: 'seokju.me',
        salt: 'salt',
        encryptedPassword: 'encrypted',
        userAgent: 'user-agent',
      });

      const [createdEvent, loggedInEvent] = execCreateLocalUserCommand(command);

      expect(createdEvent.type).toEqual(localUserCreatedEvent.type);
      expect(createdEvent.email).toEqual(command.email);
      expect(createdEvent.username).toEqual(command.username);
      expect(createdEvent.salt).toEqual(command.salt);
      expect(createdEvent.encryptedPassword).toEqual(command.encryptedPassword);
      expect(createdEvent.timestamp).toBeValidDateStr();

      expect(loggedInEvent.type).toEqual(userLoggedInEvent.type);
      expect(loggedInEvent.userAgent).toEqual(command.userAgent);
      expect(loggedInEvent.timestamp).toBeValidDateStr();
    });
  });
});
