export default interface EnvironmentConfig {
  FirebaseProjectId?: string;
  FirebaseCredentials?: object;
  eventstore: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
}
