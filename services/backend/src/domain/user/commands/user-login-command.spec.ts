import { UserEventTypes } from '../events';
import { execUserLoginCommand, UserLoginCommand } from './user-login-command';

describe('domain.user.commands.userLoginCommand', () => {
  test('should return ["UserLoggedIn"] events.', () => {
    const userAgent = 'some user agent';
    const command = new UserLoginCommand({ id: '1', userAgent });
    const [userLoggedInEvent] = execUserLoginCommand(command);

    expect(userLoggedInEvent.type).toEqual(UserEventTypes.USER_LOGGED_IN);
    expect(userLoggedInEvent.payload.userAgent).toEqual(userAgent);
    expect(userLoggedInEvent.payload.timestamp).toBeValidDateStr();
  });
});
