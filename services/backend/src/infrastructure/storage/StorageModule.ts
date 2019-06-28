import { Module } from '@nestjs/common';
import RxChildProcess from '../../utility/RxChildProcess';
import AWSS3 from './AWSS3';
import { STORAGE } from './injections';

@Module({
  providers: [
    {
      provide: STORAGE,
      useFactory(rxChildProcess) {
        return new AWSS3(rxChildProcess);
      },
      inject: [RxChildProcess],
    },
  ],
})
export default class StorageModule {
}
