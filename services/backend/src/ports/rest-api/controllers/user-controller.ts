import { Body, Controller, Post } from '@nestjs/common';
import { UserCommandHandler } from '../../../app/command-handlers';
import { AuthService } from '../../../infra/auth';
import { CreateLocalUserDto } from '../dtos';

@Controller('user')
export class UserController {
  constructor(
    private readonly userCommandHandler: UserCommandHandler,
    private readonly authService: AuthService,
  ) {
  }

  @Post()
  async createLocalUser(@Body() dto: CreateLocalUserDto) {
    const userAuth = await this.userCommandHandler.handleCreateLocalUserCommand(dto);

    await this.authService.putLocalUserInfo(userAuth);

    const token = await this.authService.createToken({
      username: userAuth.name,
      email: userAuth.email,
    });

    return {
      id: userAuth.id,
      email: userAuth.email,
      name: userAuth.name,
      token,
    };
  }
}
