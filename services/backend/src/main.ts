import { NestFactory } from '@nestjs/core';
import environment from './environment';
import ServerModule from './port/http/ServerModule';

// Sometimes 'nodemon' keep exists in process event if it was killed.
// That makes problem that port numbers are duplicated.
// Below code will ensure 'nodemon' process removed out from process when the
// 'SIGNINT' event happen.
//
// Reference:
//  https://github.com/remy/nodemon/issues/1025#issuecomment-308049864
process.on('SIGINT', () => {
  console.log('💀');
  process.exit();
});

async function bootstrap() {
  const app = await NestFactory.create(ServerModule);
  await app.listen(environment.SERVER_PORT);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
