import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { localUserCreatedEvent } from 'domain/user';
import { from } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { createSaga, ofEventType } from '../../infra/cqrs';
import { UserService } from '../services';

@Injectable()
export class UserSagas {
  readonly setEmailAndUsernameWhenUserCreated = createSaga(
    events =>
      events.pipe(
        ofEventType(localUserCreatedEvent),
        concatMap(event => {
          const { email, username } = event;

          return from(this.userService.setEmailAndUsername(email, username));
        }),
      ),
    { dispatch: false },
  );

  private readonly userService: UserService;

  constructor(private readonly moduleRef: ModuleRef) {
    this.userService = this.moduleRef.get(UserService, { strict: false });
  }
}
