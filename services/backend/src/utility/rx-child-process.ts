import { spawn, SpawnOptions as NodeSpawnOptions } from 'child_process';
import { Observable } from 'rxjs';

interface SpawnReport {
  type: 'stdout' | 'stderr' | 'message';
  data: Buffer | any;
}

export interface SpawnOptions extends NodeSpawnOptions {
  killSignal?: string;
}

export function fromSpawn(command: string, args?: string[], options?: SpawnOptions) {
  const { killSignal, ...restOptions } = options;

  return new Observable<SpawnReport>(subscriber => {
    const childProcess = spawn(command, args, restOptions);

    childProcess.stdout.setEncoding('utf8');
    childProcess.stderr.setEncoding('utf8');

    childProcess.stdout.on('data', data => {
      subscriber.next({ type: 'stdout', data });
    });

    childProcess.stderr.on('data', data => {
      subscriber.next({ type: 'stderr', data });
    });

    childProcess.on('message', data => {
      subscriber.next({ type: 'message', data });
    });

    childProcess.on('exit', code => {
      if (code !== 0) {
        subscriber.error();
      } else {
        subscriber.complete();
      }
    });

    return () => {
      childProcess.removeAllListeners();
      childProcess.kill(killSignal);
    };
  });
}
