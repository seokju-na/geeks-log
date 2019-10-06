import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR as GLOBAL_INTERCEPTOR } from '@nestjs/core';
import { AppModule } from 'app/app-module';
import { APP_COMMAND_HANDLERS } from 'app/command-handlers';
import { APP_SAGAS } from 'app/sagas';
import { AuthModule } from 'infra/auth';
import { CacheModule } from 'infra/cache';
import { CqrsModule } from 'infra/cqrs';
import { EventstoreModule } from 'infra/eventstore';
import { StorageModule } from 'infra/storage';
import { UtilityModule } from 'utility/utility-module';
import { AuthController, UserController } from './controllers';
import { ExceptionInterceptor } from './exception-interceptor';

@Module({
  imports: [
    AppModule,
    AuthModule,
    EventstoreModule,
    CacheModule,
    CqrsModule.initialize({
      commandHandlers: APP_COMMAND_HANDLERS,
      queryHandlers: [],
      sagas: APP_SAGAS,
    }),
    StorageModule,
    UtilityModule,
  ],
  providers: [
    {
      provide: GLOBAL_INTERCEPTOR,
      useClass: ExceptionInterceptor,
    },
  ],
  controllers: [AuthController, UserController],
})
export class RestApiModule {}
