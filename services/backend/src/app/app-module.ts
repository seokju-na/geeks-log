import { Module } from '@nestjs/common';
import { CacheModule } from '../infra/cache';
import { EventstoreModule } from '../infra/eventstore';
import { UtilityModule } from '../utility';
import { UserCommandHandler } from './command-handlers';
import { UserService } from './user-service';

@Module({
  imports: [
    CacheModule,
    EventstoreModule,
    UtilityModule,
  ],
  providers: [
    UserService,
    UserCommandHandler,
  ],
  exports: [
    UserService,
    UserCommandHandler,
  ],
})
export class AppModule {
}
