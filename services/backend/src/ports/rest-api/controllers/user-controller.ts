import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { userEmailDuplicatedException, usernameDuplicatedException } from 'app/exceptions';
import { UserService } from 'app/services';
import { EventTypeOf } from 'domain/core';
import {
  createLocalUserCommand,
  execCreateLocalUserCommand,
  localUserCreatedEvent,
} from 'domain/user';
import { AuthService } from 'infra/auth';
import { Cqrs } from 'infra/cqrs';
import { Encryption } from 'utility/encryption';
import environment from '../../../environment';
import { CreateLocalUserDto } from '../dtos';
import { FindUserByEmailQuery, FindUserByNameQuery } from '../queries';

const encryptOptions = environment.auth.encryptOptions;

@Controller('user')
export class UserController {
  constructor(
    private readonly cqrs: Cqrs,
    private readonly encryption: Encryption,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('check-email')
  async checkUserEmailIsUnique(@Query() query: FindUserByEmailQuery) {
    if (!(await this.userService.isUserEmailUnique(query.email))) {
      throw userEmailDuplicatedException();
    }
  }

  @Get('check-username')
  async checkUsernameIsUnique(@Query() query: FindUserByNameQuery) {
    if (!(await this.userService.isUsernameUnique(query.username))) {
      throw usernameDuplicatedException();
    }
  }

  @Post()
  async createLocalUser(@Body() dto: CreateLocalUserDto) {
    const { email, password, username, userAgent } = dto;

    // Encrypt password
    const { salt, encryptedPassword } = await this.encryptPassword(password);

    // Execute command
    const command = createLocalUserCommand({
      email,
      username,
      encryptedPassword,
      salt,
      userAgent,
    });
    const [event] = await this.cqrs.executeCommand<typeof execCreateLocalUserCommand>(command);

    return await this.ensureUserAuthFromEvent(event);
  }

  private async encryptPassword(password: string) {
    const { salt: saltBuf, encryptedText: encryptedPassword } = await this.encryption.encrypt(
      password,
      encryptOptions,
    );

    return { salt: saltBuf.toString('base64'), encryptedPassword };
  }

  private async ensureUserAuthFromEvent(event: EventTypeOf<typeof localUserCreatedEvent>) {
    const { id, email, username, encryptedPassword, salt } = event;

    await this.authService.putLocalUserInfo({
      id,
      email,
      name: username,
      encryptedPassword,
      salt,
    });

    const token = await this.authService.createToken({ username, email });
    console.log(token);
    console.log('hello');

    return {
      id,
      email,
      name: username,
      token,
    };
  }
}
