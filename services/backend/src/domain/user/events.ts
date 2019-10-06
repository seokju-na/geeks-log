import { props } from '@geeks-log/event-system';
import { createEvent } from '../core';
import { UserId } from './types';

export const userLoggedInEvent = createEvent(
  'user.loggedIn',
  props<{ timestamp: string; userAgent: string }>(),
);

export const localUserCreatedEvent = createEvent(
  'user.localUserCrated',
  props<{
    id: UserId;
    email: string;
    username: string;
    encryptedPassword: string;
    salt: string;
    timestamp: string;
  }>(),
);
