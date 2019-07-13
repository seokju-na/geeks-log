import { Observable } from 'rxjs';
import { asyncStubSet } from './asyncStubSet';

type MockType = 'promise' | 'observable';

type ParametersOf<T, K extends keyof T> = T[K] extends (...args: infer P) => any
  ? P
  : never;

type NonAsyncReturnTypeOf<T, K extends keyof T> = T[K] extends (...args: any) => infer R
  ? R extends Promise<infer A>
    ? A
    : R extends Observable<infer B>
      ? B
      : R
  : never;

interface MockBehavior<Result> {
  flush(result: Result): void;

  error(error?: Error | string | any): void;
}

type MockAnnotation<T> = {
  [method in keyof T]?: MockType;
};

export type MockInstance<T> = T & {
  _stubNames: string[];

  expect<K extends keyof T>(
    methodName: K,
    args: ParametersOf<T, K>,
  ): MockBehavior<NonAsyncReturnTypeOf<T, K>>;

  clear<K extends keyof T>(methodName: K): void;

  clearAll(): void;
};

function _getStubName(className: string, methodName: string) {
  return `${className}#${methodName}`;
}

export function createAsyncMock<T>(
  className: string,
  annotation: MockAnnotation<T>,
): MockInstance<T> {
  // eslint-disable-next-line
  const instance = {
    _stubNames: [],
  } as MockInstance<T>;

  const getStubName = methodName => _getStubName(className, methodName);

  for (const method of Object.keys(annotation)) {
    const type = annotation[method];
    const stubName = getStubName(method as string);

    instance._stubNames.push(stubName);

    if (type === 'promise') {
      instance[method] = asyncStubSet.makePromiseStub<any>(stubName);
    } else if (type === 'observable') {
      instance[method] = asyncStubSet.makeObservableStub<any>(stubName);
    }
  }

  instance.expect = function expect<K extends keyof T>(
    methodName: K,
    args: ParametersOf<T, K>,
  ): MockBehavior<NonAsyncReturnTypeOf<T, K>> {
    if (args.length > 0) {
      asyncStubSet.validateCall(methodName as string, args);
    }

    return {
      flush(result) {
        asyncStubSet.flush(methodName as string, result);
      },
      error(error?: Error | string | any): void {
        asyncStubSet.error(methodName as string, error);
      },
    };
  };

  instance.clear = function clear<K extends keyof T>(methodName: K) {
    asyncStubSet.clear(getStubName(methodName));
  };

  instance.clearAll = function clearAll() {
    for (const stubName of instance._stubNames) {
      asyncStubSet.clear(stubName);
    }
  };

  return instance;
}
