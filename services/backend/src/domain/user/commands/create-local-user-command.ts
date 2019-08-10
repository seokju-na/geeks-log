import { Command, createId } from '../../core';
import { LocalUserCreatedEvent, UserEventTypes, UserLoggedInEvent } from '../events';
import { execUserLoginCommand, UserLoginCommand } from './user-login-command';

export class CreateLocalUserCommand extends Command {
  constructor(public readonly payload: {
    email: string;
    username: string;
    salt: string;
    encryptedPassword: string;
    userAgent: string;
  }) {
    super();
  }
}

export function execCreateLocalUserCommand({ payload }: CreateLocalUserCommand): [LocalUserCreatedEvent, UserLoggedInEvent] {
  const id = `user-${createId()}`;
  const {
    email,
    username,
    salt,
    encryptedPassword,
    userAgent,
  } = payload;
  const timestamp = new Date().toISOString();
  const [loggedInEvent] = execUserLoginCommand(new UserLoginCommand({ id, userAgent }));

  return [
    {
      type: UserEventTypes.LOCAL_USER_CREATED,
      payload: {
        id,
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
