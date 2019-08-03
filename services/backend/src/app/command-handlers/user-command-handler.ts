import { Inject, Injectable } from '@nestjs/common';
import { createId } from '../../domain/core';
import { createLocalUserCommand, userLoginCommand } from '../../domain/user/commands';
import environment from '../../environment';
import { UserAuth } from '../../infra/auth/types';
import { Eventstore, EVENTSTORE_TOKEN } from '../../infra/eventstore';
import { Encryption } from '../../utility';
import { CreateLocalUserCommandDto, UserLoginDto } from '../dtos';
import { userEmailDuplicatedException, usernameDuplicatedException } from '../exceptions';
import { UserService } from '../user-service';

const encryptOptions = environment.auth.encryptOptions;

@Injectable()
export class UserCommandHandler {
  constructor(
    private readonly userService: UserService,
    private readonly encryption: Encryption,
    @Inject(EVENTSTORE_TOKEN) private readonly eventstore: Eventstore,
  ) {
  }

  async handleUserLoginCommand(streamId: string, dto: UserLoginDto) {
    await this.eventstore.save(streamId, userLoginCommand(dto));
  }

  async handleCreateLocalUserCommand(dto: CreateLocalUserCommandDto) {
    const {
      email,
      username,
      password,
      userAgent,
    } = dto;

    if (!await this.userService.isUserEmailUnique(email)) {
      throw userEmailDuplicatedException();
    } else if (!await this.userService.isUsernameUnique(username)) {
      throw usernameDuplicatedException();
    }

    const { salt: saltBuf, encryptedText: encryptedPassword } = await this.encryption.encrypt(
      password,
      encryptOptions,
    );
    const salt = saltBuf.toString('base64');

    const id = this.createNewStreamId();
    const events = createLocalUserCommand({
      email,
      username,
      salt,
      encryptedPassword,
      userAgent,
    });

    await this.eventstore.save(id, events);
    await this.userService.setEmailAndUsername(email, username);

    const userAuth: UserAuth = {
      id,
      email,
      name: username,
      encryptedPassword,
      salt,
    };
    return userAuth;
  }

  private createNewStreamId() {
    return `user-${createId()}`;
  }
}
