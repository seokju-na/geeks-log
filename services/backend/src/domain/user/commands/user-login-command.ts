import { Command } from '../../core';
import { UserEventTypes, UserLoggedInEvent } from '../events';

export class UserLoginCommand extends Command {
  constructor(public readonly payload: { id: string; userAgent: string }) {
    super();
  }
}

export function execUserLoginCommand({ payload }: UserLoginCommand): [UserLoggedInEvent] {
  const { userAgent } = payload;
  const timestamp = new Date().toISOString();

  return [
    {
      type: UserEventTypes.USER_LOGGED_IN,
      payload: {
        timestamp,
        userAgent,
      },
    },
  ];
}
