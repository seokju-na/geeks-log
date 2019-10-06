import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  createLocalUserCommand,
  execCreateLocalUserCommand,
  execUserLoginCommand,
  userLoginCommand,
} from 'domain/user';
import { createCommandHandler } from 'infra/cqrs';
import { Eventstore, EVENTSTORE_TOKEN, ExpectedVersion } from 'infra/eventstore';
import { userEmailDuplicatedException, usernameDuplicatedException } from '../exceptions';
import { UserService } from '../services';

@Injectable()
export class UserCommands {
  readonly login = createCommandHandler(userLoginCommand, async command => {
    const events = execUserLoginCommand(command);
    await this.eventstore.save(command.id, []);

    return events;
  });

  readonly createLocalUser = createCommandHandler(createLocalUserCommand, async command => {
    const { email, username } = command;

    if (!(await this.userService.isUserEmailUnique(email))) {
      throw userEmailDuplicatedException();
    } else if (!(await this.userService.isUsernameUnique(username))) {
      throw usernameDuplicatedException();
    }

    const events = execCreateLocalUserCommand(command);
    await this.eventstore.save(events[0].id, [], {
      expectedVersion: ExpectedVersion.NoStream,
    });

    return events;
  });

  private readonly userService: UserService;
  private readonly eventstore: Eventstore;

  constructor(private readonly moduleRef: ModuleRef) {
    this.userService = this.moduleRef.get(UserService, { strict: false });
    this.eventstore = this.moduleRef.get(EVENTSTORE_TOKEN, { strict: false });
  }
}
