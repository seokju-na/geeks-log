import { Inject, Injectable, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';
import { from, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as path from 'path';
import Note from '../../domain/note/types/Note';
import environment from '../../environment';
import Eventstore from '../../infrastructure/eventstore/Eventstore';
import { EVENTSTORE } from '../../infrastructure/eventstore/injections';
import { STORAGE } from '../../infrastructure/storage/injections';
import Storage from '../../infrastructure/storage/Storage';
import { Job } from '../../utility/JobExecutorFactory';
import RxChildProcess from '../../utility/RxChildProcess';
import { NoteSnapshotEvent } from '../projection/NoteSnapshotEvent';

let uniqueId = 0;

interface BuildAndDeployJob extends Job {
  readonly data: {
    noteId: string;
    note: Note;
    version: number;
  };
}

interface Options {
  /** @default 10 */
  maxDeploySize?: number;
}

export const OPTIONS = 'port.sagas.NoteViewerServingSaga.OPTIONS';

@Injectable()
export default class NoteViewerServingSaga implements OnModuleInit, OnModuleDestroy {
  private readonly options: Options;
  private readonly currentWorkingJobs = new Map<string, Subscription>();
  private readonly pendingJobs: DeployJobInfo[] = [];

  private readonly routeUpdates = new Map<string, Subscription>();

  private noteSnapshotUpdatesSubscription = Subscription.EMPTY;

  constructor(
    @Inject(EVENTSTORE) private readonly eventstore: Eventstore,
    @Inject(STORAGE) private readonly storage: Storage,
    @Optional() @Inject(OPTIONS) options: Options,
    private rxChildProcess: RxChildProcess,
  ) {
    this.options = withDefaultOptions(options);
  }

  onModuleInit() {
    this.subscribeToNoteCreation();
  }

  onModuleDestroy() {
    this.noteSnapshotUpdatesSubscription.unsubscribe();

    for (const jobId of this.currentWorkingJobs.keys()) {
      this.finishDeployJob(jobId);
    }

    this.currentWorkingJobs.clear();
  }

  private subscribeToNoteCreation() {
    const handleStartDeployJob = (event: NoteSnapshotEvent) => {
      const { noteId, note, version } = event.payload;

      this.startDeployJob({
        id: `deploy-${uniqueId++}`,
        noteId,
        note,
        version,
      });
    };

    const handleError = (error: Error) => {
    };

    this.noteSnapshotUpdatesSubscription =
      this.eventstore
        .stream('noteSnapshots')
        .subscribe(handleStartDeployJob, handleError);
  }

  private startDeployJob(job: DeployJobInfo): void {
    if (this.currentWorkingJobs.size < this.options.maxDeploySize) {
      this.currentWorkingJobs.set(job.id, this.executeJob(job));
    } else {
      this.pendingJobs.push(job);
    }
  }

  private finishDeployJob(jobId: string): void {
    if (this.currentWorkingJobs.has(jobId)) {
      const subscription = this.currentWorkingJobs.get(jobId);
      subscription.unsubscribe();

      this.currentWorkingJobs.delete(jobId);
    }
  }

  private startPendingDeployJobIfExists(): void {
    let index = 0;
    const availableJobSize = this.options.maxDeploySize - this.currentWorkingJobs.size;

    while (index < availableJobSize && this.pendingJobs.length > 0) {
      const job = this.pendingJobs.pop();

      if (job !== undefined) {
        this.startDeployJob(job);
      }

      index++;
    }
  }

  private executeJob(job: DeployJobInfo): Subscription {
    const { id, noteId, note, version } = job;
    const { maxDeploySize } = this.options;

    const directoryName = `${+(id.split('-')[1]) % maxDeploySize}`;
    const cwd = path.resolve(environment.noteServingSagaConfig.TMP_PATH, directoryName);

    const s3Path = `@${note.authorId}/${noteId}/${version}`;

    const buildArtifact = () => this.rxChildProcess.fromSpawn(
      'yarn',
      ['build'],
      {
        cwd,
        env: {
          VERSION: `${version}`,
          NOTE_DATA: JSON.stringify(job.note),
        },
      },
    );

    const uploadArtifact = () => async () => {
      await this.storage.uploadDirectory(
        environment.NOTE_SNAPSHOT_BUCKET_NAME,
        s3Path,
        path.resolve(cwd, 'out/'),
      );
    };

    const handleJobComplete = () => {
      this.finishDeployJob(job.id);
      this.startPendingDeployJobIfExists();
    };

    return buildArtifact()
      .pipe(
        switchMap(() => from(uploadArtifact())),
      )
      .subscribe(handleJobComplete);
  }
}

function withDefaultOptions(options?: Options): Options {
  return {
    maxDeploySize: 3,
    ...options,
  };
}

interface DeployJobInfo {
  readonly id: string;
  readonly noteId: string;
  readonly note: Note;
  readonly version: number;
}
