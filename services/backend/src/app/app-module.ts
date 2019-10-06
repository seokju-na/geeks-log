import { Module, Provider } from '@nestjs/common';
import { UtilityModule } from '../utility';
import { UserService } from './services';

const providers: Provider[] = [UserService];

@Module({
  imports: [UtilityModule],
  providers: providers,
  exports: providers,
})
export class AppModule {}
