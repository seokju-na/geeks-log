import axios from 'axios';
import { addSeconds } from 'date-fns';
import { Request, RequestHandler, Response } from 'express';
import proxy from 'http-proxy-middleware';
import { API_PROXY_PATHNAME, AUTH_COOKIE_NAME } from './constants';
import { isPathMatch } from './paths';

const knownIgnorePaths = ['/_next*', '/_next/*'];
const queryTokenFromRequestCookies = (request: Request) => {
  const cookies = request.cookies;

  if (cookies != null && cookies[AUTH_COOKIE_NAME]) {
    return cookies[AUTH_COOKIE_NAME];
  }
  return null;
};

export function createAuthMiddleware({
  apiUrl,
  authUnneededPaths,
}: {
  apiUrl: string;
  authUnneededPaths: string[];
}): RequestHandler {
  const http = axios.create({ baseURL: apiUrl });
  const ignorePaths = [...knownIgnorePaths, ...authUnneededPaths];

  return async (req, res, next) => {
    if (isPathMatch(req.path, ignorePaths)) {
      next();
      return;
    }

    const token = queryTokenFromRequestCookies(req);

    if (token !== null) {
      try {
        const { data: userAuth } = await http.get('/auth', {
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
      [`^${API_PROXY_PATHNAME}`]: '',
    },
    onProxyReq(proxyReq, req) {
      const token = queryTokenFromRequestCookies(req as Request);

      if (token !== null) {
        proxyReq.setHeader('authorization', `Bearer ${token}`);
      }
    },
    onProxyRes(proxyRes, _, res) {
      const token = proxyRes.headers['geeks-log-authorized'];

      if (token) {
        const expireDate = addSeconds(new Date(), cookieExpiresInSeconds);

        (res as Response).cookie(AUTH_COOKIE_NAME, token, {
          httpOnly: true,
          secure: enableHttps,
          expires: expireDate,
          maxAge: cookieExpiresInSeconds,
        });
      }
    },
  });
}
