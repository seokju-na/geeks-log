import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import environment from '../../environment';
import { UtilityModule } from '../../utility';
import { CacheModule } from '../cache';
import { AuthService } from './auth-service';
import { AuthStrategy } from './auth-strategy';

const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });

@Module({
  imports: [
    passportModule,
    JwtModule.register({
      secret: environment.auth.secretKey,
      signOptions: {
        expiresIn: environment.auth.expiresIn,
      },
    }),
    UtilityModule,
    CacheModule,
  ],
  providers: [AuthService, AuthStrategy],
  exports: [passportModule, AuthService, AuthStrategy],
})
export class AuthModule {}
