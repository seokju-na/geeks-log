import { Provider } from '@nestjs/common';
import { SpawnOptions } from 'child_process';
import { Observable, Subject } from 'rxjs';
import RxChildProcess from '../../utility/RxChildProcess';

const isEqual = require('lodash.isequal') as (source: any, dist: any) => boolean;

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

interface MatchObject<A> {
  methodName: keyof RxChildProcess;
  args: A;
}

export enum MatchLiterals {
  ANY = '__ANY__',
}

export class Stub<R, A> {
  constructor(
    readonly matches: MatchObject<A>,
    private readonly stream: Subject<any>,
    private mockRxChildProcess: MockRxChildProcess,
  ) {
  }

  flush(data?: R) {
    this.stream.next(data);
    this.mockRxChildProcess._deleteStub(this);
  }

  error(error: any) {
    this.stream.error(error);
    this.mockRxChildProcess._deleteStub(this);
  }
}

interface Attachment {
  matches: MatchObject<any>;
  stream: Subject<any>;
}

export default class MockRxChildProcess extends RxChildProcess {
  static provide(): Provider {
    return {
      provide: RxChildProcess,
      useClass: MockRxChildProcess,
    };
  }

  private attachments: Attachment[] = [];

  verify() {
    if (this.attachments.length > 0) {
      throw new Error(`${this.attachments.length} not verified stubs left.`);
    }
  }

  clear() {
    this.attachments = [];
  }

  expect<R = any, A = any>(matches: MatchObject<A>): Stub<R, A> {
    const attachment = this.findAttachment(matches);

    if (!attachment) {
      throw new Error(`Cannot find matched stub: ${matches.methodName}, ${matches.args}`);
    }

    return new Stub(matches, attachment.stream, this);
  }

  expectFromSpawn(args: Parameters<typeof RxChildProcess.prototype.fromSpawn>) {
    return this.expect<void>({
      methodName: 'fromSpawn',
      args,
    });
  }

  fromSpawn(command: string, args?: string[], options?: SpawnOptions): Observable<void> {
    return this.createAttachment<Parameters<typeof RxChildProcess.prototype.fromSpawn>>(
      'fromSpawn',
      [command, args, options],
    );
  }

  _deleteStub(stub: Stub<any, any>): void {
    const attachment = this.findAttachment(stub.matches);

    if (attachment) {
      attachment.stream.complete();

      const index = this.attachments.indexOf(attachment);

      if (index !== -1) {
        this.attachments.splice(index, 1);
      }
    }
  }

  private createAttachment<A>(methodName: keyof RxChildProcess, args: A): Observable<any> {
    const matches: MatchObject<A> = { methodName, args };
    const stream = new Subject<any>();

    this.attachments.push({ matches, stream });

    return stream.asObservable();
  }

  private findAttachment(matches: MatchObject<any>): Attachment | null {
    const matchArgs = (source: MatchObject<any>, dist: MatchObject<any>): boolean => {
      let allMatched = true;

      for (let i = 0; i < source.args.length; i++) {
        if (dist.args[i] === MatchLiterals.ANY) {
          continue;
        }

        if (!isEqual(source.args[i], dist.args[i])) {
          allMatched = false;
          break;
        }
      }

      return allMatched;
    };

    return this.attachments.find(attachment =>
      attachment.matches.methodName === matches.methodName
      && matchArgs(attachment.matches, matches),
    ) || null;
  }
}
