import { ContextWithUserAuth } from './types';

export function queryUserAuth({ req }: ContextWithUserAuth) {
  if (req && req.userAuth != null) {
    return req.userAuth;
  }

  return null;
}
