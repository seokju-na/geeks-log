import cookieParser from 'cookie-parser';
import express from 'express';
import next from 'next';
import { NextServerConfig } from './config';
import { API_PROXY_PATHNAME } from './constants';
import {
  createApiProxyMiddleware,
  createAuthMiddleware,
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

  app.renderOpts.poweredByHeader = false;

  await app.prepare();

  const server = express();

  // Remove x-powered-by
  server.disable('x-powered-by');

  // cookie parser
  server.use(cookieParser());

  // health check
  server.get('/_health', (_, res) => {
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
