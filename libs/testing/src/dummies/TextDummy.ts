import Dummy from './Dummy';

export default class TextDummy extends Dummy<string> {
  private id = 0;

  constructor(private readonly namespace = 'Text') {
    super();
  }

  create(): string {
    return `${this.namespace}${this.id++}`;
  }
}
