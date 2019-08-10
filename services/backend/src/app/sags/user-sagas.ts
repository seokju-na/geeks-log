import { Injectable } from '@nestjs/common';
import { from } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { LocalUserCreatedEvent, UserEventTypes } from '../../domain/user/events';
import { ISaga, ofEventType, Saga } from '../../infra/cqrs';
import { UserService } from '../user-service';

@Injectable()
export class UserSagas {
  @Saga({ dispatchCommand: false })
  setEmailAndUsernameWhenUserCreated: ISaga = events => events.pipe(
    ofEventType(UserEventTypes.LOCAL_USER_CREATED),
    concatMap(({ payload: { email, username } }: LocalUserCreatedEvent) =>
      from(this.userService.setEmailAndUsername(email, username)),
    ),
  );

  constructor(private readonly userService: UserService) {
  }
}
