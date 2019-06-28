import UserCreatedEvent from '../events/UserCreatedEvent';
import UserLoggedInEvent from '../events/UserLoggedInEvent';
import createLocalUserCommand from './createLocalUserCommand';

describe('domain.user.commands.createLocalUserCommand', () => {
  test('should return ["UserCreated", "UserLoggedIn"] events.', () => {
    const [userCreatedEvent, userLoggedInEvent] = createLocalUserCommand({
      email: 'test@test.com',
      name: 'hello',
      salt: 'salt',
      passwordDigest: 'passwordDigest',
      userAgent: 'userAgent',
    }) as [UserCreatedEvent, UserLoggedInEvent];

    expect(userCreatedEvent.type).toEqual('UserCreated');
    expect(userCreatedEvent.payload).toEqual({
      type: 'local',
      email: 'test@test.com',
      name: 'hello',
      salt: 'salt',
      passwordDigest: 'passwordDigest',
    });

    expect(userLoggedInEvent.type).toEqual('UserLoggedIn');
    expect(userLoggedInEvent.payload.userAgent).toEqual('userAgent');
    expect(userLoggedInEvent.payload.timestamp).toBeDefined();
  });
});
