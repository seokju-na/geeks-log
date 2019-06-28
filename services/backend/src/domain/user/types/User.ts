interface UserPrototype {
  email: string;
  name: string;
  displayName?: string;
  lastLoginTimestamp: number;
}

interface LocalUser extends UserPrototype {
  type: 'local';
  /** Base64 encoded string. */
  passwordDigest: string;
  /** Base64 encoded string. */
  salt: string;
}

interface OAuthUser extends UserPrototype {
  type: 'oauth';
  provider: string;
}

type User = LocalUser | OAuthUser;
export default User;
