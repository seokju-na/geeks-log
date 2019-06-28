import { Module } from '@nestjs/common';
import RxChildProcess from './RxChildProcess';
import Encryption from './encryption';
import JobExecutorFactory from './JobExecutorFactory';

@Module({
  providers: [
    RxChildProcess,
    Encryption,
    JobExecutorFactory,
  ],
})
export default class UtilityModule {
}
