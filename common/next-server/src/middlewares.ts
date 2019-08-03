import axios from 'axios';
import { serialize } from 'cookie';
import { addSeconds } from 'date-fns';
import { RequestHandler } from 'express';
import proxy from 'http-proxy-middleware';
import { API_PROXY_PATHNAME, AUTH_COOKIE_NAME } from './constants';
import { UserAuth } from './types';

export const xPoweredByMiddleware: RequestHandler = (_, res, next) => {
  res.set('x-powered-by', 'geeks-log');
  next();
};

export function createAuthMiddleware({
  apiUrl,
}: {
  apiUrl: string;
  authUnneededPaths: string[];
}): RequestHandler {
  const http = axios.create({ baseURL: apiUrl });

  return async (req, res, next) => {
    const cookies = req.cookies;

    if (cookies != null && cookies[AUTH_COOKIE_NAME]) {
      const token = cookies[AUTH_COOKIE_NAME];

      try {
        const { data: userAuth } = await http.get<UserAuth>('/auth', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        (req as any).userAuth = { ...userAuth, token };
      } catch {
        res.clearCookie(AUTH_COOKIE_NAME);
        (req as any).userAuth = null;
      }
    }

    next();
  };
}

export function createApiProxyMiddleware({
  apiUrl,
  enableHttps,
  cookieExpiresInSeconds,
}: {
  apiUrl: string;
  enableHttps: boolean;
  cookieExpiresInSeconds: number;
}): RequestHandler {
  return proxy({
    target: apiUrl,
    changeOrigin: true,
    pathRewrite: {
      [`^/${API_PROXY_PATHNAME}`]: '',
    },
    onProxyRes(proxyRes, _, res) {
      const token = proxyRes.headers['geeks-log-authorized'];

      if (token) {
        const expireDate = addSeconds(new Date(), cookieExpiresInSeconds);
        const setCookie = serialize(AUTH_COOKIE_NAME, token as string, {
          httpOnly: true,
          secure: enableHttps,
          expires: expireDate,
          maxAge: cookieExpiresInSeconds,
        });

        res.setHeader('Set-Cookie', setCookie);
      }
    },
  });
}
