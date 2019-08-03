import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import environment from './environment';
import { RestApiModule } from './ports/rest-api';

export async function createServerModule() {
  return await NestFactory.create(RestApiModule);
}

export async function bootstrapServer() {
  const server = await createServerModule();
  server.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true }));

  await server.listen(environment.serverPort);
}
