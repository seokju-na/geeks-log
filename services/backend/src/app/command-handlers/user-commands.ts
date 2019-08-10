import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  CreateLocalUserCommand,
  execCreateLocalUserCommand,
  execUserLoginCommand,
  UserLoginCommand,
} from '../../domain/user/commands';
import { CommandHandler } from '../../infra/cqrs';
import { Eventstore, EVENTSTORE_TOKEN, ExpectedVersion } from '../../infra/eventstore';
import { userEmailDuplicatedException, usernameDuplicatedException } from '../exceptions';
import { UserService } from '../user-service';

@Injectable()
export class UserCommands {
  private readonly eventstore: Eventstore;

  constructor(
    private readonly userService: UserService,
    private readonly moduleRef: ModuleRef,
  ) {
    this.eventstore = this.moduleRef.get(EVENTSTORE_TOKEN, { strict: false });
  }

  @CommandHandler(UserLoginCommand)
  async handleUserLoginCommand(command: UserLoginCommand) {
    await this.eventstore.save(command.payload.id, execUserLoginCommand(command));
  }

  @CommandHandler(CreateLocalUserCommand)
  async handleCreateLocalUserCommand(command: CreateLocalUserCommand) {
    const { email, username } = command.payload;

    if (!await this.userService.isUserEmailUnique(email)) {
      throw userEmailDuplicatedException();
    } else if (!await this.userService.isUsernameUnique(username)) {
      throw usernameDuplicatedException();
    }

    const events = execCreateLocalUserCommand(command);
    await this.eventstore.save(
      events[0].payload.id,
      events,
      { expectedVersion: ExpectedVersion.NoStream },
    );

    return events;
  }
}
