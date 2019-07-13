import { isValid } from 'date-fns';

export abstract class Dummy<T> {
  abstract create(...args: any): T;
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
  public constructor(private readonly namespace = 'id') {
    super();
  }

  public create(): string {
    return `${this.namespace}-${globalUniqueId++}`;
  }
}

export class TextDummy extends Dummy<string> {
  private id = 0;

  public constructor(private readonly namespace = 'Text') {
    super();
  }

  public create(): string {
    return `${this.namespace}${this.id}`;
  }
}

export class TimestampDummy extends Dummy<number> {
  public create(date: Date = new Date()): number {
    if (!isValid(date)) {
      return new Date().getTime();
    }

    return date.getTime();
  }
}
