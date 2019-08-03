require('dotenv').config();

const env = process.env;
const isTest = env.NODE_ENV === 'test';
const parseNumber = (value: string | undefined, defaultValue?: number): number => {
  return typeof value === 'string' ? +value : defaultValue;
};

export interface Environment {
  readonly isProduction: boolean;
  readonly isTest: boolean;
  readonly serverPort: number;
  readonly eventstore: {
    readonly host: string;
    readonly port: number;
    readonly username: string;
    readonly password: string;
  };
  readonly auth: {
    readonly encryptOptions: {
      readonly iteration: number;
      readonly keySize: number;
      readonly saltSize: number;
    };
    readonly expiresIn: string;
    readonly secretKey: string;
  };
  readonly redis: {
    readonly uri: string;
  };
}

const environment: Environment = {
  isProduction: env.NODE_ENV === 'production',
  isTest,
  serverPort: parseNumber(env.SERVER_PORT, 5000),
  eventstore: {
    host: env.EVENTSTORE_HOST,
    port: parseNumber(env.EVENTSTORE_PORT, 1113),
    username: env.EVENTSTORE_USERNAME,
    password: env.EVENTSTORE_PASSWORD,
  },
  auth: {
    encryptOptions: {
      iteration: isTest ? 10 : parseNumber(env.AUTH_ENCRYPTION_ITERATION, 1056),
      keySize: isTest ? 16 : parseNumber(env.AUTH_ENCRYPTION_KEY_SIZE, 64),
      saltSize: isTest ? 16 : parseNumber(env.AUTH_ENCRYPTION_SALT_SIZE, 64),
    },
    expiresIn: env.AUTH_EXPIRES_IN || '1hours',
    secretKey: env.AUTH_SECRET_KEY,
  },
  redis: {
    uri: env.REDIS_URI,
  },
};

export default environment;
