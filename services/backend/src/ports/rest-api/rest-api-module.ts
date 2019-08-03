import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppModule } from '../../app/app-module';
import { AuthModule } from '../../infra/auth';
import { CacheModule } from '../../infra/cache';
import { EventstoreModule } from '../../infra/eventstore';
import { AuthController, UserController } from './controllers';
import { ExceptionInterceptor } from './exception-interceptor';

@Module({
  imports: [
    AppModule,
    AuthModule,
    EventstoreModule,
    CacheModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ExceptionInterceptor,
    },
  ],
  controllers: [
    AuthController,
    UserController,
  ],
})
export class RestApiModule {
}
