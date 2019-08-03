import { UserEventTypes, UserLoggedInEvent } from '../events';

interface Params {
  userAgent: string;
}

export function userLoginCommand({ userAgent }: Params): [UserLoggedInEvent] {
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
