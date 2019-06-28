import { Module } from '@nestjs/common';
import AWSCloudFront from '../cdn/AWSCloudFront';
import { DNS } from './injections';

@Module({
  providers: [
    {
      provide: DNS,
      useFactory() {
        return new AWSCloudFront();
      },
    },
  ],
})
export default class DNSModule {
}
