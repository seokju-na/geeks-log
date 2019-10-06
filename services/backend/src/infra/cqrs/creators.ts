import {
  createDispatchable,
  Creator,
  DisallowTypeProperty,
  Dispatchable,
  DispatchableCreator,
  FunctionWithParametersType,
} from '@geeks-log/event-system';
import { QUERY_TYPE } from './constants';
import { CommandHandler, QueryHandler, Saga, SagaOptions, TypedQuery } from './interfaces';
import {
  COMMAND_HANDLER_METADATA_TOKEN,
  QUERY_HANDLER_METADATA_TOKEN,
  SAGA_METADATA_TOKEN,
} from './tokens';

export function createCommandHandler<C extends DispatchableCreator>(
  command: C,
  handler: CommandHandler<C>,
) {
  Object.defineProperty(handler, COMMAND_HANDLER_METADATA_TOKEN, {
    value: command.type,
  });

  return handler;
}

type DispatchType<T> = T extends { dispatch: infer U } ? U : unknown;
type ObservableReturnType<T> = T extends false ? unknown : Dispatchable;

export function createSaga<
  C extends SagaOptions,
  T extends DispatchType<C>,
  O extends ObservableReturnType<T>
>(saga: Saga<O>, options?: Partial<C>) {
  const value: SagaOptions = {
    dispatch: true,
    ...options,
  };

  Object.defineProperty(saga, SAGA_METADATA_TOKEN, {
    value,
  });

  return saga;
}

export function createQuery<T extends string>(type: T): DispatchableCreator<T, () => TypedQuery<T>>;
export function createQuery<T extends string, P extends object>(
  type: T,
  config: { _as: 'props'; _p: P },
): DispatchableCreator<T, (props: P) => P & TypedQuery<T>>;
export function createQuery<T extends string, P extends any[], R extends object>(
  type: T,
  creator: Creator<P, DisallowTypeProperty<R>>,
): FunctionWithParametersType<P, R & TypedQuery<T>> & TypedQuery<T>;
export function createQuery<T extends string, C extends Creator>(type: T, config?: C): Creator {
  return createDispatchable(QUERY_TYPE, type, config);
}

export function createQueryHandler<C extends DispatchableCreator>(
  query: C,
  handler: QueryHandler<C>,
) {
  Object.defineProperty(handler, QUERY_HANDLER_METADATA_TOKEN, {
    value: query.type,
  });

  return handler;
}
