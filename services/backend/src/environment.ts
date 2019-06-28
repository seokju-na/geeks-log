require('dotenv').config();

const env = process.env;
const parseNumber = (value: string | undefined, defaultValue?: number): number => {
  return typeof value === 'string' ? +value : defaultValue;
};

interface Environment {
  readonly AWS_REGION: string;
  readonly AWS_KEY: string;
  readonly AWS_SECRET: string;
  readonly EVENTSTORE_HOST: string;
  readonly EVENTSTORE_PORT: number;
  readonly EVENTSTORE_USERNAME: string;
  readonly EVENTSTORE_PASSWORD: string;
  readonly SERVER_PORT: number;
  readonly NOTE_SNAPSHOT_BUCKET_NAME: string;
  readonly noteServingSagaConfig: {
    readonly TMP_PATH: string;
    readonly MAX_DEPLOY_SIZE?: number;
  };
}

const environment: Environment = {
  AWS_REGION: env.AWS_REGION,
  AWS_KEY: env.AWS_KEY,
  AWS_SECRET: env.AWS_SECRET,
  EVENTSTORE_HOST: env.EVENTSTORE_HOST,
  EVENTSTORE_PORT: parseNumber(env.EVENTSTORE_PORT, 1113),
  EVENTSTORE_USERNAME: env.EVENTSTORE_USERNAME,
  EVENTSTORE_PASSWORD: env.EVENTSTORE_PASSWORD,
  SERVER_PORT: parseNumber(env.SERVER_PORT, 5000),
  NOTE_SNAPSHOT_BUCKET_NAME: env.NOTE_SNAPSHOT_BUCKET_NAME,
  noteServingSagaConfig: {
    TMP_PATH: env.NOTE_VIEWER_SERVING_TMP_PATH,
    MAX_DEPLOY_SIZE: parseNumber(env.NOTE_VIEWER_SERVING_MAX_DEPLOY_SIZE),
  },
};

export default environment;
