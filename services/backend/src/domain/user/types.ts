import { createId } from 'domain/core';

export type UserId = string;

export function createUserId(): UserId {
  return `user-${createId()}`;
}

export type OAuthProvider = 'github' | 'google' | 'facebook' | 'twitter';

interface UserBase {
  email: string;
  name: string;
  displayName?: string;
  lastLoginTimestamp: number;
}

export interface LocalUser extends UserBase {
  type: 'local';
  /** Base64 encoded string. */
  encryptedPassword: string;
  /** Base64 encoded string. */
  salt: string;
}

export interface OAuthUser extends UserBase {
  type: 'oauth';
  provider: OAuthProvider;
}

export type User = LocalUser | OAuthUser;
