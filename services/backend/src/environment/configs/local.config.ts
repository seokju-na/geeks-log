import EnvironmentConfig from './EnvironmentConfig';

const localEnvironmentConfig: EnvironmentConfig = {
  EventstoreUrl: 'http://localhost:2113',
  FirebaseCredentials: require('./private-key.json'),
};

export default localEnvironmentConfig;
