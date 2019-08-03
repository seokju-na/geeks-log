import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import environment from '../../environment';
import { AuthService } from './auth-service';
import { userUnauthorizedException } from './exceptions';
import { JWTPayload } from './types';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: environment.auth.secretKey,
    });
  }

  async validate(payload: JWTPayload) {
    const { email } = payload;
    const userAuth = await this.authService.queryLocalUserInfoByEmail(email);

    if (userAuth === null) {
      throw userUnauthorizedException();
    }

    return userAuth;
  }
}
