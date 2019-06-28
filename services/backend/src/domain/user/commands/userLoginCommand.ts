import UserEvent from '../events';

interface Params {
  userAgent: string;
}

export default function userLoginCommand({ userAgent }: Params): UserEvent[] {
  const timestamp = new Date().getTime();

  return [{
    type: 'UserLoggedIn',
    payload: {
      timestamp,
      userAgent,
    },
  }];
}
