import { Dispatchable, DispatchableCreator } from '@geeks-log/event-system';
import { CommandTypeOf, Event, matchType } from 'domain/core';
import { QUERY_TYPE } from 'infra/cqrs/constants';
import { Observable } from 'rxjs';

export type CommandHandler<
  C extends DispatchableCreator = DispatchableCreator,
  R extends Event[] = Event[]
> = (command: CommandTypeOf<C>) => Promise<R>;

export type Saga<R> = (events: Observable<Event>) => Observable<R>;

export interface SagaOptions {
  /** @default true */
  dispatch?: boolean;
}

export interface Query extends Dispatchable {}

export interface TypedQuery<T extends string> extends Query {
  readonly type: T;
}

export type QueryTypeOf<T> = T extends DispatchableCreator<infer Type>
  ? TypedQuery<Type> & ReturnType<T>
  : never;

export function isQuery(value: unknown): value is Query {
  return matchType(value, QUERY_TYPE);
}

export type QueryHandler<C extends DispatchableCreator = DispatchableCreator, R = any> = (
  query: QueryTypeOf<C>,
) => R;
