import { isValid } from 'date-fns';

export default abstract class Dummy<T> {
  abstract create(...args: any[]): T;
}

export function createDummies<T>(dummy: Dummy<T>, count: number): T[] {
  const dummies: T[] = [];

  for (let i = 0; i < count; i++) {
    dummies.push(dummy.create());
  }

  return dummies;
}

let globalUniqueId = 0;

export class StringIdDummy extends Dummy<string> {
  constructor(private readonly namespace = 'id') {
    super();
  }

  create(): string {
    return `${this.namespace}-${globalUniqueId++}`;
  }
}

export class TextDummy extends Dummy<string> {
  private id = 0;

  constructor(private readonly namespace = 'Text') {
    super();
  }

  create(): string {
    return `${this.namespace}${this.id}`;
  }
}

export class TimestampDummy extends Dummy<number> {
  create(date: Date = new Date()): number {
    if (!isValid(date)) {
      return new Date().getTime();
    }

    return date.getTime();
  }
}
