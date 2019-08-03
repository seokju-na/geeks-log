import { fakeAsync, flush } from '@geeks-log/testing';
import { Test } from '@nestjs/testing';
import { cold, hot } from 'jest-marbles';
import { Job, JobExecutorFactory } from './job-executor-factory';

interface SampleJob extends Job {
  data: string;
}

const makeFrame = (count: number) => Array(count).fill(0).map(() => '-').join('');

describe('utility.JobExecutorFactory', () => {
  let jobExecutorFactory: JobExecutorFactory;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JobExecutorFactory,
      ],
    }).compile();

    jobExecutorFactory = module.get(JobExecutorFactory);
  });

  test('should run all jobs.', () => {
    const executor = jobExecutorFactory.create<SampleJob>({
      maxWorkingJobSize: 3,
      executeJob: job => cold(`${makeFrame(job.id + 1)}a|`, { a: job.data }),
    });

    executor.queueJob({ id: 0, data: 'pizza' });
    executor.queueJob({ id: 1, data: 'rice' });
    executor.queueJob({ id: 2, data: 'donuts' });

    const expected = cold('-abc', {
      a: 'pizza',
      b: 'rice',
      c: 'donuts',
    });

    expect(executor.results).toBeObservable(expected);
  });

  test('should run pending jobs whenever job completes.', fakeAsync(() => {
    const executor = jobExecutorFactory.create<SampleJob>({
      maxWorkingJobSize: 3,
      executeJob: job => {
        switch (job.id) {
          case 0:
            return cold('a|', { a: job.data });
          case 1:
            return cold('--a|', { a: job.data });
          case 2:
            return cold('----a|', { a: job.data });
          case 3:
            return cold('a|', { a: job.data });
          case 4:
            return cold('-a|', { a: job.data });
        }
      },
    });

    executor.queueJob({ id: 0, data: 'pizza' });
    executor.queueJob({ id: 1, data: 'rice' });
    executor.queueJob({ id: 2, data: 'donuts' });
    executor.queueJob({ id: 3, data: 'coffee' });
    executor.queueJob({ id: 4, data: 'beer' });

    flush();

    const expected = hot('adbec', {
      a: 'pizza',
      b: 'rice',
      c: 'donuts',
      d: 'coffee',
      e: 'beer',
    });

    expect(executor.results).toBeObservable(expected);
  }));

  test('fake async test', fakeAsync(() => {
    let value = 'foo';

    function setValueToBar() {
      return new Promise<string>((resolve) => {
        resolve('bar');
      });
    }

    setValueToBar().then(val => {
      value = val;
    });

    flush();

    expect(value).toEqual('bar');
  }));
});
