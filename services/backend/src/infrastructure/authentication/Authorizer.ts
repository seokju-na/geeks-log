export interface AuthClaims {
  sub: string;
  iss: string;
  uid: string;
  [key: string]: any;
}

export default interface Authorizer {
  authenticate(token: string): Promise<AuthClaims | null>;
}
