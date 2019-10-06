import * as path from 'path';

const CI = process.env.CI;
const TEST = process.env.NODE_ENV === 'test';

if (!CI) {
  const testEnvPath = path.resolve(process.cwd(), 'test.env');
  const config = TEST ? { path: testEnvPath } : undefined;

  require('dotenv').config(config);
}

const env = process.env;
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
  readonly aws: {
    readonly region: string;
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
    readonly cloudFrontDistributionId: string;
  };
}

const environment: Environment = {
  isProduction: env.NODE_ENV === 'production',
  isTest: TEST,
  serverPort: parseNumber(env.SERVER_PORT, 5000),
  eventstore: {
    host: env.EVENTSTORE_HOST,
    port: parseNumber(env.EVENTSTORE_PORT, 1113),
    username: env.EVENTSTORE_USERNAME,
    password: env.EVENTSTORE_PASSWORD,
  },
  auth: {
    encryptOptions: {
      iteration: TEST ? 10 : parseNumber(env.AUTH_ENCRYPTION_ITERATION, 1056),
      keySize: TEST ? 16 : parseNumber(env.AUTH_ENCRYPTION_KEY_SIZE, 64),
      saltSize: TEST ? 16 : parseNumber(env.AUTH_ENCRYPTION_SALT_SIZE, 64),
    },
    expiresIn: env.AUTH_EXPIRES_IN || '1hours',
    secretKey: env.AUTH_SECRET_KEY,
  },
  redis: {
    uri: env.REDIS_URI,
  },
  aws: {
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    cloudFrontDistributionId: env.AWS_CLOUD_FRONT_DISTRIBUTION_ID,
  },
};

export default environment;
