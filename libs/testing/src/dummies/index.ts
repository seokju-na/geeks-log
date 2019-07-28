import Dummy from './Dummy';
import StringIdDummy from './StringIdDummy';
import TextDummy from './TextDummy';
import TimestampDummy from './TimestampDummy';
import EmailDummy from './EmailDummy';
import getUniqueId from './getUniqueId';

export {
  Dummy,
  StringIdDummy,
  TextDummy,
  TimestampDummy,
  EmailDummy,
  getUniqueId,
};

export function createDummies<T>(dummy: Dummy<T>, count: number): T[] {
  const dummies: T[] = [];

  for (let i = 0; i < count; i++) {
    dummies.push(dummy.create());
  }

  return dummies;
}
