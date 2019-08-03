import { bootstrapServer } from './server';

bootstrapServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
