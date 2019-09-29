/**
 * Source are taken from ngrx library and modified a bit.
 * See: https://github.com/ngrx/platform/blob/8.3.0/modules/store/src/models.ts
 */

export const $$TYPE = Symbol('$$type');

export interface Dispatchable {
  type: string;
}

// declare to make it property-renaming safe
export declare interface TypedDispatchable<T extends string> extends Dispatchable {
  readonly type: T;
}

export type DispatchableType<A> = A extends DispatchableCreator<infer T, infer C>
  ? ReturnType<C> & { type: T }
  : never;

export type TypeId<T> = () => T;

export type InitialState<T> = Partial<T> | TypeId<Partial<T>> | void;

/**
 * A function that takes an `Action` and a `State`, and returns a `State`.
 * See `createReducer`.
 */
export interface Reducer<T, V extends Dispatchable = Dispatchable> {
  (state: T | undefined, action: V): T;
}

export type DisallowTypeProperty<T> = T extends { type: any }
  ? TypePropertyIsNotAllowed
  : T extends { [$$TYPE]: any }
    ? TypePropertyIsNotAllowed : T;

export const typePropertyIsNotAllowedMsg = 'type, $$type property is not allowed in action creators';
type TypePropertyIsNotAllowed = typeof typePropertyIsNotAllowedMsg;

export type Creator<P extends any[] = any[],
  R extends object = object> = R extends { type: any }
  ? TypePropertyIsNotAllowed
  : FunctionWithParametersType<P, R>;

export type PropsReturnType<T extends object> = T extends { type: any }
  ? TypePropertyIsNotAllowed
  : { _as: 'props'; _p: T };

export type DispatchableCreator<T extends string = string,
  C extends Creator = Creator> = C & TypedDispatchable<T>;

export type FunctionWithParametersType<P extends unknown[], R = void> = (
  ...args: P
) => R;

export type ParametersType<T> = T extends (...args: infer U) => unknown
  ? U
  : never;
