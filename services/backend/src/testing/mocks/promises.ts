interface MockPromise {
  fn: jest.Mock;

  flush(data?: any): void;

  error(error?: any): void;
}

class MockPromiseSet {
  private mocks = new Map<string, MockPromise>();

  mock(name: string): jest.Mock<Promise<any>> {
    if (this.mocks.has(name)) {
      return this.mocks.get(name).fn;
    }

    const fn = jest.fn();

    fn.mockImplementation(() => new Promise((resolve, reject) => {
      this.mocks.set(name, {
        fn,
        flush: resolve,
        error: reject,
      });
    }));

    return fn;
  }

  clear(name: string) {
    if (this.mocks.has(name)) {
      this.mocks.get(name).fn.mockClear();
    }
  }

  clearAll(name: string) {
    for (const { fn } of this.mocks.values()) {
      fn.mockClear();
    }
  }

  flush(name: string, data?: any) {
    if (this.mocks.has(name)) {
      this.mocks.get(name).flush(data);
    } else {
      throw new Error(`cannot find mock name with ${name}.`);
    }
  }

  error(name: string, error?: Error | string | any) {
    if (this.mocks.has(name)) {
      this.mocks.get(name).error(error);
    } else {
      throw new Error(`cannot find mock name with ${name}.`);
    }
  }
}

const mockPromiseSet = new MockPromiseSet();

export default mockPromiseSet;
