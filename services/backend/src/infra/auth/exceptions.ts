import { InfraException } from '../shared';

export enum AuthExceptionCodes {
  USER_UNAUTHORIZED = 'infra.auth.userUnauthorized',
}

export function userUnauthorizedException() {
  return new InfraException(
    AuthExceptionCodes.USER_UNAUTHORIZED,
    'Unauthorized',
  );
}
