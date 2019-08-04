import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserCommandHandler } from '../../../app/command-handlers';
import { AuthService } from '../../../infra/auth';
import { UserAuth } from '../../../infra/auth/types';
import { SignInWithEmailAndPasswordDto } from '../dtos';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userCommandHandler: UserCommandHandler,
  ) {
  }

  @Post('sign-in-local')
  async signInWithEmailAndPassword(
    @Body() dto: SignInWithEmailAndPasswordDto,
    @Res() response,
  ) {
    const { email, password, userAgent } = dto;
    let userAuthWithToken;

    try {
      userAuthWithToken = await this.authService.signInWithEmailAndPassword(email, password);
    } catch {
      throw new UnauthorizedException();
    }

    const { id, token, name } = userAuthWithToken;
    await this.userCommandHandler.handleUserLoginCommand(id, { userAgent });

    // Set custom authorized header
    response.setHeader('geeks-log-authorized', token);
    response.send({
      id,
      email,
      name,
      token,
    });
  }

  @Get()
  @UseGuards(AuthGuard())
  async authorize(@Req() request) {
    const { id, email, name } = request.user as UserAuth;

    return {
      id,
      email,
      name,
    };
  }
}
