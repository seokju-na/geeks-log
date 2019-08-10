import { Module, Provider } from '@nestjs/common';
import { UtilityModule } from '../utility';
import { UserCommands } from './command-handlers';
import { UserSagas } from './sags';
import { UserService } from './user-service';

const providers: Provider[] = [
  UserService,
  UserCommands,
  UserSagas,
];

@Module({
  imports: [
    UtilityModule,
  ],
  providers: providers,
  exports: providers,
})
export class AppModule {
}
