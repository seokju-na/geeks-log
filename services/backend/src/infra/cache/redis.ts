import { Provider } from '@nestjs/common';
import IORedis, { Redis } from 'ioredis';
import environment from '../../environment';
import { Cache, CACHE_TOKEN } from './cache';

interface ConstructOptions {
  uri: string;
}

export class RedisCache implements Cache {
  private client: Redis;

  constructor({ uri }: ConstructOptions) {
    this.client = new IORedis(uri);
  }

  chain() {
    return this.client.pipeline() as any;
  }

  get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: string) {
    await this.client.set(key, value);
  }

  hget(key: string, field: string) {
    return this.client.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<boolean> {
    const result = await this.client.hset(key, field, value);
    return !!result;
  }

  async hgetAll<T>(key: string) {
    const value = (await this.client.hgetall(key)) as T;

    // If value not exists, returns empty object.
    if (Object.keys(value).length === 0) {
      return null;
    }

    return value;
  }
}

export function provideRedisCache(): Provider {
  return {
    provide: CACHE_TOKEN,
    useFactory() {
      return new RedisCache({ uri: environment.redis.uri });
    },
    inject: [],
  };
}
