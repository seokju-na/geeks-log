import { bootstrapServer } from './ports/server';

bootstrapServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
