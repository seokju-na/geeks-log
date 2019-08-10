import { UserEventTypes } from '../events';
import { CreateLocalUserCommand, execCreateLocalUserCommand } from './create-local-user-command';

describe('domain.user.commands.createLocalUserCommand', () => {
  test('should return ["LocalUserCreated", "UserLoggedIn"] events.', () => {
    const command = new CreateLocalUserCommand({
      email: 'seokju.me@gmail.com',
      username: 'seokju.me',
      salt: 'salt',
      encryptedPassword: 'encrypted',
      userAgent: 'user-agent',
    });

    const [createdEvent, loggedInEvent] = execCreateLocalUserCommand(command);

    expect(createdEvent.type).toEqual(UserEventTypes.LOCAL_USER_CREATED);
    expect(createdEvent.payload.email).toEqual(command.payload.email);
    expect(createdEvent.payload.username).toEqual(command.payload.username);
    expect(createdEvent.payload.salt).toEqual(command.payload.salt);
    expect(createdEvent.payload.encryptedPassword).toEqual(command.payload.encryptedPassword);
    expect(createdEvent.payload.timestamp).toBeValidDateStr();

    expect(loggedInEvent.type).toEqual(UserEventTypes.USER_LOGGED_IN);
    expect(loggedInEvent.payload.userAgent).toEqual(command.payload.userAgent);
    expect(loggedInEvent.payload.timestamp).toBeValidDateStr();
  });
});
