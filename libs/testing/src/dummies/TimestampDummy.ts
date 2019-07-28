import { isValid } from 'date-fns';
import Dummy from './Dummy';

export default class TimestampDummy extends Dummy<number> {
  create(date: Date = new Date()): number {
    if (!isValid(date)) {
      return new Date().getTime();
    }

    return date.getTime();
  }
}
