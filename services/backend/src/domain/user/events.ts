import { DomainEvent } from '../core';

export enum UserEventTypes {
  USER_LOGGED_IN = 'user.loggedIn',
  LOCAL_USER_CREATED = 'user.localUserCreated',
}

export interface UserLoggedInEvent extends DomainEvent {
  type: UserEventTypes.USER_LOGGED_IN;
  payload: {
    timestamp: string;
    userAgent: string;
  };
}

export interface LocalUserCreatedEvent extends DomainEvent {
  type: UserEventTypes.LOCAL_USER_CREATED;
  payload: {
    id: string;
    email: string;
    username: string;
    encryptedPassword: string;
    salt: string;
    timestamp: string;
  };
}
