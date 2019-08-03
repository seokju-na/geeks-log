import { Injectable } from '@nestjs/common';
import { Observable, ReplaySubject, Subscription } from 'rxjs';

export interface Job<Data = any> {
  readonly id: number;
  readonly data: Data;
}

interface JobExecutorOptions<J> {
  maxWorkingJobSize: number;
  executeJob: (job: J) => Observable<any>;
}

export class JobExecutor<J extends Job> {
  private readonly currentWorkingJobs = new Map<number, Subscription>();
  private readonly pendingJobs: J[] = [];
  private readonly resultStream = new ReplaySubject<any>();
  private readonly errorStream = new ReplaySubject<any>();

  constructor(private readonly options: JobExecutorOptions<J>) {
  }

  get results() {
    return this.resultStream.asObservable();
  }

  get errors() {
    return this.errorStream.asObservable();
  }

  queueJob(job: J) {
    if (this.currentWorkingJobs.size < this.options.maxWorkingJobSize) {
      this.startJob(job);
    } else {
      this.pendingJobs.push(job);
    }
  }

  private startJob(job: J) {
    const subscription = this.options.executeJob(job).subscribe(
      (result) => {
        this.resultStream.next(result);
      },
      (error) => {
        this.errorStream.next(error);
      },
      () => {
        this.finishJob(job.id);
        this.queueJobsFromPending();
      },
    );

    this.currentWorkingJobs.set(job.id, subscription);
  }

  private finishJob(jobId: number) {
    if (this.currentWorkingJobs.has(jobId)) {
      const subscription = this.currentWorkingJobs.get(jobId);
      subscription.unsubscribe();

      this.currentWorkingJobs.delete(jobId);
    }
  }

  private queueJobsFromPending() {
    let index = 0;
    const availableJobSize = this.options.maxWorkingJobSize - this.currentWorkingJobs.size;

    while (index < availableJobSize && this.pendingJobs.length > 0) {
      const job = this.pendingJobs.shift();

      if (job !== undefined) {
        this.startJob(job);
      }

      index++;
    }
  }
}

@Injectable()
export class JobExecutorFactory {
  create<J extends Job>(options: JobExecutorOptions<J>): JobExecutor<J> {
    return new JobExecutor<J>(options);
  }
}
