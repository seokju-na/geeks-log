export interface NextServerConfig {
  isDev: boolean;
  port: number;
  apiUrl: string;
  authUnneededPaths?: string[];
  /** @default 90 days */
  cookieExpiresInSeconds?: number;
}
