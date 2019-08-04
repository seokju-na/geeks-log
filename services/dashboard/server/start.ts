import { runNextServer } from '@geeks-log/next-server';

runNextServer({
  port: 4000,
  apiUrl: 'http://localhost:5000',
  isDev: process.env.NODE_ENV !== 'production',
}).catch((error) => {
  console.error(error); // eslint-disable-line no-console
  process.exit(1);
});
