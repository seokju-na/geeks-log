import { Module } from '@nestjs/common';
import environment from '../../environment';
import GYEventstore from './GYEventstore';
import { EVENTSTORE } from './injections';

@Module({
  providers: [
    {
      provide: EVENTSTORE,
      useFactory() {
        return new GYEventstore({
          connectOptions: {
            host: environment.EVENTSTORE_HOST,
            port: environment.EVENTSTORE_PORT,
          },
          credentials: {
            username: environment.EVENTSTORE_USERNAME,
            password: environment.EVENTSTORE_PASSWORD,
          },
        });
      },
    },
  ],
  exports: [],
})
export default class EventstoreModule {
}
