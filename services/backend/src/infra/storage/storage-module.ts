import { Module } from '@nestjs/common';
import { provideAwsS3 } from './aws-s3';

const awsS3Provider = provideAwsS3();

@Module({
  providers: [awsS3Provider],
  exports: [awsS3Provider],
})
export class StorageModule {}
