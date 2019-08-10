import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppModule } from '../../app';
import { AuthModule } from '../../infra/auth';
import { CacheModule } from '../../infra/cache';
import { CqrsModule } from '../../infra/cqrs';
import { EventstoreModule } from '../../infra/eventstore';
import { UtilityModule } from '../../utility';
import { AuthController, UserController } from './controllers';
import { ExceptionInterceptor } from './exception-interceptor';

@Module({
  imports: [
    AuthModule,
    EventstoreModule,
    CacheModule,
    CqrsModule,
    UtilityModule,
    AppModule,
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
