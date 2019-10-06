import { createReducer, on } from '@geeks-log/event-system';
import { Event } from '../core';
import produce from 'immer';
import { localUserCreatedEvent, userLoggedInEvent } from './events';

export interface UserState {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly lastLoginTimestamp: string;
}

export const userReducer = createReducer<UserState, Event>(
  undefined,
  on(localUserCreatedEvent, (state, event) => {
    const { id, email, username, timestamp } = event;

    return {
      id,
      email,
      username,
      lastLoginTimestamp: timestamp,
    };
  }),
  on(userLoggedInEvent, (state, event) => {
    const { timestamp } = event;

    return produce(state, draft => {
      draft.lastLoginTimestamp = timestamp;
    });
  }),
);
