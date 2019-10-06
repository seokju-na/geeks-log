import { fakeAsync, flush } from '@geeks-log/testing';
import { Test } from '@nestjs/testing';
import { cold, hot } from 'jest-marbles';
import { Job, JobExecutorFactory } from './job-executor-factory';

interface SampleJob extends Job {
  data: string;
}

// const makeFrame = (count: number) => Array(count).fill(0).map(() => '-').join('');

xdescribe('utility.JobExecutorFactory', () => {
  let jobExecutorFactory: JobExecutorFactory;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [JobExecutorFactory],
    }).compile();

    jobExecutorFactory = module.get(JobExecutorFactory);
  });

  // test('should run all jobs.', () => {
  //   const executor = jobExecutorFactory.create<SampleJob>({
  //     maxWorkingJobSize: 3,
  //     executeJob: job => cold(`${makeFrame(job.id + 1)}a|`, { a: job.data }),
  //   });
  //
  //   executor.queueJob({ id: 0, data: 'pizza' });
  //   executor.queueJob({ id: 1, data: 'rice' });
  //   executor.queueJob({ id: 2, data: 'donuts' });
  //
  //   const expected = cold('-abc', {
  //     a: 'pizza',
  //     b: 'rice',
  //     c: 'donuts',
  //   });
  //
  //   expect(executor.results).toBeObservable(expected);
  // });
  //
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

    const expected = hot('(abcd)(efg)(hij)(kl)(mn)o', {
      // Frame 0
      a: { type: 'started', jobId: 0 },
      b: { type: 'started', jobId: 1 },
      c: { type: 'started', jobId: 2 },
      d: { type: 'data', jobId: 0, data: 'pizza' },
      // Frame 10
      e: { type: 'completed', jobId: 0 },
      f: { type: 'started', jobId: 3 },
      g: { type: 'data', jobId: 3, data: 'coffee' },
      // Frame 20
      h: { type: 'data', jobId: 1, data: 'rice' },
      i: { type: 'completed', jobId: 3 },
      j: { type: 'started', jobId: 4 },
      // Frame 30
      k: { type: 'completed', jobId: 1 },
      l: { type: 'data', jobId: 4, data: 'beer' },
      // Frame 40
      m: { type: 'data', jobId: 2, data: 'donuts' },
      n: { type: 'completed', jobId: 4 },
      // Frame 50
      o: { type: 'completed', jobId: 2 },
    });

    expect(executor.reports).toBeObservable(expected);
  }));
});
