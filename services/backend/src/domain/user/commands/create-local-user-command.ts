import { CommandParams } from '../../core';
import { LocalUserCreatedEvent, UserEventTypes, UserLoggedInEvent } from '../events';
import { userLoginCommand } from './user-login-command';

interface Params extends CommandParams<typeof userLoginCommand> {
  email: string;
  username: string;
  salt: string;
  encryptedPassword: string;
}

export function createLocalUserCommand({
  email,
  username,
  salt,
  encryptedPassword,
  userAgent,
}: Params): [LocalUserCreatedEvent, UserLoggedInEvent] {
  const timestamp = new Date().toISOString();
  const [loggedInEvent] = userLoginCommand({ userAgent });

  return [
    {
      type: UserEventTypes.LOCAL_USER_CREATED,
      payload: {
        email,
        username,
        salt,
        encryptedPassword,
        timestamp,
      },
    },
    loggedInEvent,
  ];
}
