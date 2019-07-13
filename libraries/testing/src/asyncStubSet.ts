import { Observable } from 'rxjs';
import { matchArguments } from './matches';

function getLastCall(mock: jest.Mock) {
  const { calls } = mock.mock;
  return calls[calls.length - 1];
}

interface Stub<Result, ReturnType> {
  fn: jest.Mock<ReturnType>;

  flush(data?: Result): void;

  error(error: Error | string | any): void;
}

class AsyncStubSet {
  private stubs = new Map<string, Stub<any, any>>();

  makePromiseStub<Result = any>(name: string): jest.Mock<Promise<Result>> {
    if (this.stubs.has(name)) {
      return this.stubs.get(name).fn;
    }

    const fn = jest.fn();

    fn.mockImplementation(() => new Promise<Result>((resolve, reject) => {
      this.stubs.set(name, {
        fn,
        flush: resolve,
        error: reject,
      });
    }));

    return fn;
  }

  makeObservableStub<Result = any>(name: string): jest.Mock<Observable<Result>> {
    if (this.stubs.has(name)) {
      return this.stubs.get(name).fn;
    }

    const fn = jest.fn();

    fn.mockImplementation(() => new Observable<Result>((observer) => {
      function flush(data: Result) {
        observer.next(data);
        // TODO: complete observer
      }

      function error(err: Error | string | any) {
        observer.error(err);
      }

      this.stubs.set(name, {
        fn,
        flush,
        error,
      });
    }));

    return fn;
  }

  clear(name: string) {
    if (this.stubs.has(name)) {
      this.stubs.get(name).fn.mockClear();
    }
  }

  clearAll() {
    for (const { fn } of this.stubs.values()) {
      fn.mockClear();
    }
  }

  validateCall(name: string, args: any[]) {
    if (this.stubs.has(name)) {
      const lastCall = getLastCall(this.stubs.get(name).fn);
      if (!matchArguments(lastCall, args)) {
        throw new Error('arguments is not matched');
      }
    } else {
      throw new Error(`cannot find stub name with ${name}.`);
    }
  }

  flush<Result = any>(name: string, data?: Result) {
    if (this.stubs.has(name)) {
      this.stubs.get(name).flush(data);
    } else {
      throw new Error(`cannot find stub name with ${name}.`);
    }
  }

  error(name: string, error: Error | string | any) {
    if (this.stubs.has(name)) {
      this.stubs.get(name).error(error);
    } else {
      throw new Error(`cannot find stub name with ${name}.`);
    }
  }
}

export const asyncStubSet = new AsyncStubSet();
