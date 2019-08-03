export const CACHE_TOKEN = 'infra.cache.Cache';

interface CacheChain {
  get(key: string): CacheChain;

  hget(key: string, field: string): CacheChain;

  set(key: string, value: string): Promise<void>;

  hset(key: string, field: string, value: string): CacheChain;

  exec(): Promise<CacheChainExecResult[]>;
}

type CacheChainExecResult = [Error | null, string];

export interface Cache {
  chain(): CacheChain;

  get(key: string): Promise<string | null>;

  hget(key: string, field: string): Promise<string | null>;

  set(key: string, value: string): Promise<void>;

  /**
   * @returns boolean If return is true, new field in the hash and value was set. Else return is
   *   false, field already exists in the hash and the value updated.
   */
  hset(key: string, field: string, value: string): Promise<boolean>;

  hgetAll<T>(key: string): Promise<T | null>;
}

export enum CacheErrorCodes {
  HashParseError,
}
