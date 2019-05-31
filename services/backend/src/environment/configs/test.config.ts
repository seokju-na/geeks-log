import EnvironmentConfig from './EnvironmentConfig';

const testEnvironmentConfig: EnvironmentConfig = {
  eventstore: {
    host: '127.0.0.1',
    port: 1113,
    credentials: {
      username: 'admin',
      password: 'changeit',
    },
  },
};

export default testEnvironmentConfig;
