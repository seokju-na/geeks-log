import { Module } from '@nestjs/common';
import { Encryption } from './encryption';
import { JobExecutorFactory } from './job-executor-factory';

@Module({
  providers: [Encryption, JobExecutorFactory],
  exports: [Encryption, JobExecutorFactory],
})
export class UtilityModule {}
