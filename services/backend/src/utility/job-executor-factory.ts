import { Injectable } from '@nestjs/common';
import { EMPTY, Observable, ReplaySubject, Subscription } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

export type JobId = string | number;

export interface Job<Data = any> {
  readonly id: JobId;
  readonly data: Data;
}

export type JobProgressType = 'started' | 'data' | 'completed' | 'failed' | 'cancelled';

export interface JobProgressReport<J extends Job> {
  readonly type: JobProgressType;
  readonly job: J;
  readonly data?: any;
  readonly error?: any;
}

interface JobExecutorOptions<J> {
  maxWorkingJobSize: number;
  executeJob: (job: J) => Observable<any>;
  cancelJobs?: Observable<JobId>;
  reportReplayCount?: number;
}

export class JobExecutor<J extends Job> {
  private readonly currentWorkingJobs = new Map<JobId, Subscription>();
  private readonly pendingJobs: J[] = [];
  private readonly _reports: ReplaySubject<JobProgressReport<J>>;
  private readonly cancelJobSubscription = Subscription.EMPTY;

  constructor(private readonly options: JobExecutorOptions<J>) {
    const { reportReplayCount, cancelJobs } = this.options;

    this._reports = new ReplaySubject<JobProgressReport<J>>(reportReplayCount);

    if (cancelJobs) {
      this.cancelJobSubscription = this.createCancelJobSubscription(cancelJobs);
    }
  }

  get maxWorkingJobSize() {
    return this.options.maxWorkingJobSize;
  }

  get reports() {
    return this._reports.asObservable();
  }

  queueJob(job: J) {
    if (this.currentWorkingJobs.size < this.options.maxWorkingJobSize) {
      this.startJob(job);
    } else {
      this.pendingJobs.push(job);
    }
  }

  private startJob(job: J) {
    const jobId = job.id;
    const onNext = data => {
      this._reports.next({
        type: 'data',
        job,
        data,
      });
    };

    const onError = error => {
      this._reports.next({
        type: 'failed',
        job,
        error,
      });
    };

    const onComplete = () => {
      this._reports.next({
        type: 'completed',
        job,
      });

      this.finishJob(job.id);
      this.queueJobsFromPending();
    };

    const subscription = this.options
      .executeJob(job)
      .pipe(takeUntil(this.cancellationForJob(job)))
      .subscribe(onNext, onError, onComplete);

    this.currentWorkingJobs.set(jobId, subscription);
    this._reports.next({
      type: 'started',
      job,
    });
  }

  private finishJob(jobId: JobId) {
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

  private cancellationForJob(job: J) {
    if (this.options.cancelJobs) {
      return this.options.cancelJobs.pipe(
        filter(id => job.id === id),
        tap(() => {
          this._reports.next({
            type: 'cancelled',
            job,
          });
        }),
      );
    }

    return EMPTY;
  }

  private createCancelJobSubscription(cancelJobs: Observable<JobId>) {
    return cancelJobs.subscribe(jobId => {
      const index = this.pendingJobs.findIndex(job => job.id === jobId);

      if (index > -1) {
        this.pendingJobs.splice(index, 1);
      }
    });
  }
}

@Injectable()
export class JobExecutorFactory {
  create<J extends Job>(options: JobExecutorOptions<J>): JobExecutor<J> {
    return new JobExecutor<J>(options);
  }
}
