import { NextPageContext } from 'next';

export interface UserAuth {
  id: string;
  email: string;
  name: string;
  token?: string;
}

export function queryUserAuthFromContext({ req }: NextPageContext) {
  if (req !== undefined && (req as any).userAuth) {
    return (req as any).userAuth as UserAuth;
  }

  return null;
}
