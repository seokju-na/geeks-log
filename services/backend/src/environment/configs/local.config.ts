import EnvironmentConfig from './EnvironmentConfig';

const localEnvironmentConfig: EnvironmentConfig = {
  FirebaseCredentials: require('./private-key.json'),
  eventstore: {
    host: '127.0.0.1',
    port: 1113,
    credentials: {
      username: 'admin',
      password: 'changeit',
    },
  },
};

export default localEnvironmentConfig;
