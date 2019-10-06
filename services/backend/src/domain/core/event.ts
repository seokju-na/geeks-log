import {
  createDispatchable,
  Creator,
  DisallowTypeProperty,
  Dispatchable,
  DispatchableCreator,
  FunctionWithParametersType,
} from '@geeks-log/event-system';
import { EVENT_TYPE } from './constants';
import { matchType } from './utils';

export interface Event extends Dispatchable {}

export interface TypedEvent<T extends string> extends Event {
  readonly type: T;
}

export function isEvent(value: unknown): value is Event {
  return matchType(value, EVENT_TYPE);
}

export type EventTypeOf<T> = T extends DispatchableCreator<infer Type>
  ? TypedEvent<Type> & ReturnType<T>
  : never;

export function createEvent<T extends string>(type: T): DispatchableCreator<T, () => TypedEvent<T>>;
export function createEvent<T extends string, P extends object>(
  type: T,
  config: { _as: 'props'; _p: P },
): DispatchableCreator<T, (props: P) => P & TypedEvent<T>>;
export function createEvent<T extends string, P extends any[], R extends object>(
  type: T,
  creator: Creator<P, DisallowTypeProperty<R>>,
): FunctionWithParametersType<P, R & TypedEvent<T>> & TypedEvent<T>;
export function createEvent<T extends string, C extends Creator>(type: T, config?: C): Creator {
  return createDispatchable(EVENT_TYPE, type, config);
}
