import { Module } from '@nestjs/common';
import { AppModule } from '../../app/app-module';
import { AuthModule } from '../../infra/auth';
import { CacheModule } from '../../infra/cache';
import { EventstoreModule } from '../../infra/eventstore';
import { AuthController, UserController } from './controllers';

@Module({
  imports: [
    AppModule,
    AuthModule,
    EventstoreModule,
    CacheModule,
  ],
  controllers: [
    AuthController,
    UserController,
  ],
})
export class RestApiModule {
}
