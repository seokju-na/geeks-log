import { Module } from '@nestjs/common';
import { provideGYEventstore } from './gy-eventstore';

const eventstoreProvider = provideGYEventstore();

@Module({
  providers: [
    eventstoreProvider,
  ],
  exports: [
    eventstoreProvider,
  ],
})
export class EventstoreModule {
}
