import Dummy from './Dummy';
import { internet } from 'faker';

export default class EmailDummy extends Dummy<string> {
  create() {
    return internet.email();
  }
}
