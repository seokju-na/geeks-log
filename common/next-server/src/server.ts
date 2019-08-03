import cookieParser from 'cookie-parser';
import express from 'express';
import next from 'next';
import { NextServerConfig } from './config';
import { API_PROXY_PATHNAME } from './constants';
import {
  createApiProxyMiddleware,
  createAuthMiddleware,
  xPoweredByMiddleware,
} from './middlewares';

export async function runNextServer({
  port,
  isDev,
  apiUrl,
  authUnneededPaths = [],
  cookieExpiresInSeconds = 60 * 60 * 24 * 90,
}: NextServerConfig) {
  const app = next({ dev: isDev });
  const handleRequest = app.getRequestHandler();

  await app.prepare();

  const server = express();

  // cookie parser
  server.use(cookieParser());

  // x-powered-by
  server.use(xPoweredByMiddleware);

  // health check
  server.get('/health', (_, res) => {
    res.send('OK');
  });

  // api proxy
  server.use(
    API_PROXY_PATHNAME,
    createApiProxyMiddleware({
      apiUrl,
      enableHttps: !isDev,
      cookieExpiresInSeconds,
    }),
  );

  // next handler
  server.get('*', createAuthMiddleware({ apiUrl, authUnneededPaths }), handleRequest as any);

  // start server
  server.listen(port, '0.0.0.0', err => {
    if (err) {
      throw err;
    }

    console.log(`> Ready on http://localhost:${port}`);
  });
}
