import { UserEventTypes } from '../events';
import { userLoginCommand } from './user-login-command';

describe('domain.user.commands.userLoginCommand', () => {
  test('should return ["UserLoggedIn"] events.', () => {
    const userAgent = 'user-agent';
    const [userLoggedInEvent] = userLoginCommand({ userAgent });

    expect(userLoggedInEvent.type).toEqual(UserEventTypes.USER_LOGGED_IN);
    expect(userLoggedInEvent.payload.userAgent).toEqual(userAgent);
    expect(userLoggedInEvent.payload.timestamp).toBeValidDateStr();
  });
});
