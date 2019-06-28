import { Injectable } from '@nestjs/common';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { Observable } from 'rxjs';

@Injectable()
export default class RxChildProcess {
  fromSpawn(command: string, args?: string[], options?: SpawnOptions): Observable<void> {
    return this.runProcessAsObservable(spawn(command, args, options));
  }

  private runProcessAsObservable(process: ChildProcess): Observable<void> {
    return new Observable((observer) => {
      const onClose = (exitCode: number) => {
        if (exitCode === 0) {
          observer.next();
          observer.complete();
        } else {
          observer.error();
        }
      };

      const onError = (error: Error) => {
        observer.error(error);
      };

      process.on('close', onClose);
      process.on('error', onError);

      return () => {
        process.off('close', onClose);
        process.off('error', onError);

        if (!process.killed) {
          process.kill();
        }
      };
    });
  }
}
