import UserEvent from '../events';
import userLoginCommand from './userLoginCommand';

interface Params {
  email: string;
  name: string;
  salt: string;
  passwordDigest: string;
  userAgent: string;
}

export default function createLocalUserCommand({
  email,
  name,
  salt,
  passwordDigest,
  userAgent,
}: Params): UserEvent[] {
  return [
    {
      type: 'UserCreated',
      payload: {
        type: 'local',
        email,
        name,
        salt,
        passwordDigest,
      },
    },
    ...userLoginCommand({ userAgent }),
  ];
}
