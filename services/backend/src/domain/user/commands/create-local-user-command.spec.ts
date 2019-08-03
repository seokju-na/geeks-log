import { CommandParams } from '../../core';
import { UserEventTypes } from '../events';
import { createLocalUserCommand } from './create-local-user-command';

describe('domain.user.commands.createLocalUserCommand', () => {
  test('should return ["LocalUserCreated", "UserLoggedIn"] events.', () => {
    const params: CommandParams<typeof createLocalUserCommand> = {
      email: 'seokju.me@gmail.com',
      username: 'seokju.me',
      salt: 'salt',
      encryptedPassword: 'encrypted',
      userAgent: 'user-agent',
    };

    const [createdEvent, loggedInEvent] = createLocalUserCommand(params);

    expect(createdEvent.type).toEqual(UserEventTypes.LOCAL_USER_CREATED);
    expect(createdEvent.payload.email).toEqual(params.email);
    expect(createdEvent.payload.username).toEqual(params.username);
    expect(createdEvent.payload.salt).toEqual(params.salt);
    expect(createdEvent.payload.encryptedPassword).toEqual(params.encryptedPassword);
    expect(createdEvent.payload.timestamp).toBeValidDateStr();

    expect(loggedInEvent.type).toEqual(UserEventTypes.USER_LOGGED_IN);
    expect(loggedInEvent.payload.userAgent).toEqual(params.userAgent);
    expect(loggedInEvent.payload.timestamp).toBeValidDateStr();
  });
});
