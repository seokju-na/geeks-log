export interface UserAuth {
  id: string;
  email: string;
  name: string;
  /** Base64 encoded */
  encryptedPassword: string;
  /** Base64 encoded */
  salt: string;
}

export interface JWTPayload {
  email: string;
  username: string;
}
