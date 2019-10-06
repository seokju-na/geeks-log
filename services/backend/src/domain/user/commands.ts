import { props } from '@geeks-log/event-system';
import { CommandExecutor, createCommand, createTimestamp, EventTypeOf } from '../core';
import { localUserCreatedEvent, userLoggedInEvent } from './events';
import { createUserId, UserId } from './types';

export const userLoginCommand = createCommand(
  'user.login',
  props<{
    id: UserId;
    userAgent: string;
    timestamp?: string;
  }>(),
);

export const createLocalUserCommand = createCommand(
  'user.createLocalUser',
  props<{
    email: string;
    username: string;
    salt: string;
    encryptedPassword: string;
    userAgent: string;
  }>(),
);

export const execUserLoginCommand: CommandExecutor<
  typeof userLoginCommand,
  [EventTypeOf<typeof userLoggedInEvent>]
> = command => {
  const { userAgent } = command;
  const timestamp = command.timestamp ? command.timestamp : createTimestamp();

  return [userLoggedInEvent({ userAgent, timestamp })];
};

export const execCreateLocalUserCommand: CommandExecutor<
  typeof createLocalUserCommand,
  [EventTypeOf<typeof localUserCreatedEvent>, EventTypeOf<typeof userLoggedInEvent>]
> = command => {
  const id = createUserId();
  const { email, username, salt, encryptedPassword, userAgent } = command;
  const timestamp = new Date().toISOString();
  const [loggedInEvent] = execUserLoginCommand(userLoginCommand({ userAgent, id, timestamp }));

  return [
    localUserCreatedEvent({
      id,
      email,
      username,
      salt,
      encryptedPassword,
      timestamp,
    }),
    loggedInEvent,
  ];
};
