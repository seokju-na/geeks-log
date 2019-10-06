import {
  createDispatchable,
  Creator,
  Dispatchable,
  DisallowTypeProperty,
  DispatchableCreator,
  FunctionWithParametersType,
} from '@geeks-log/event-system';
import { Event } from './event';
import { COMMAND_TYPE } from './constants';
import { matchType } from './utils';

export interface Command extends Dispatchable {}

export interface TypedCommand<T extends string> extends Command {
  readonly type: T;
}

export type CommandTypeOf<T> = T extends Creator ? ReturnType<T> : never;

export function isCommand(value: unknown): value is Command {
  return matchType(value, COMMAND_TYPE);
}

export type CommandExecutor<T extends Creator = Creator, R extends Event[] = Event[]> = (
  command: CommandTypeOf<T>,
) => R;

export function createCommand<T extends string>(
  type: T,
): DispatchableCreator<T, () => TypedCommand<T>>;
export function createCommand<T extends string, P extends object>(
  type: T,
  config: { _as: 'props'; _p: P },
): DispatchableCreator<T, (props: P) => P & TypedCommand<T>>;
export function createCommand<T extends string, P extends any[], R extends object>(
  type: T,
  creator: Creator<P, DisallowTypeProperty<R>>,
): FunctionWithParametersType<P, R & TypedCommand<T>> & TypedCommand<T>;
export function createCommand<T extends string, C extends Creator>(type: T, config?: C): Creator {
  return createDispatchable(COMMAND_TYPE, type, config);
}
