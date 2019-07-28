import Dummy from './Dummy';
import getUniqueId from './getUniqueId';

export default class StringIdDummy extends Dummy<string> {
  constructor(private readonly namespace = 'id') {
    super();
  }

  create(): string {
    return `${this.namespace}-${getUniqueId()}`;
  }
}
