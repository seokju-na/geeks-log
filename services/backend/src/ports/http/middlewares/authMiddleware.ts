import { NextFunction, Request, Response } from 'express';
import Authorizer, { AuthClaims } from '../../../infrastructure/authentication/Authorizer';

export function getAuthClaimsFromRequest(request: Request & { _auth?: AuthClaims }): AuthClaims | null {
  if (request._auth) {
    return request._auth;
  }

  return null;
}

interface Options {
  authorizer: Authorizer;
  throwErrorWhenUnauthorized?: boolean;
}

const headerPrefix = 'Bearer ';

export default function authMiddleware({ authorizer, throwErrorWhenUnauthorized = true }: Options) {
  return async (request: Request, response: Response, next: NextFunction) => {
    const onUnauthorized = () => {
      if (throwErrorWhenUnauthorized) {
        response.status(403).send({ message: 'Unauthorized' });
      } else {
        next();
      }
    };

    const header = request.headers.authorization;

    if (header === undefined || !header.startsWith(headerPrefix)) {
      onUnauthorized();
      return;
    }

    const token = header.split(headerPrefix)[1];

    try {
      const authClaims = await authorizer.authenticate(token);
      console.log('Authenticated', request.url, authClaims);

      (request as any)._auth = authClaims;
      next();
    } catch (error) {
      console.error('Error while verifying ID token:', error);
      onUnauthorized();
      return;
    }
  };
}
