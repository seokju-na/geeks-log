export interface NextServerConfig {
  isDev: boolean;
  port: number;
  apiUrl: string;
  authUnneededPaths?: [];
  /** @default 90 days */
  cookieExpiresInSeconds?: number;
}
