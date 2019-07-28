import { isValid } from 'date-fns';

declare global {
  // eslint-disable-next-line
  namespace jest {
    interface Matchers<R> {
      toBeValidDateStr(): void;
    }
  }
}

expect.extend({
  toBeValidDateStr(actual: string) {
    return {
      message: () => '',
      pass: isValid(new Date(actual)),
    };
  },
});
