import { Module } from '@nestjs/common';
import { provideRedisCache } from './redis';

const cacheProvider = provideRedisCache();

@Module({
  providers: [
    cacheProvider
  ],
  exports: [
    cacheProvider
  ],
})
export class CacheModule {
}
