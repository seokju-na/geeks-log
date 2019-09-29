/**
 * Source are taken from ngrx library and modified a bit.
 * See: https://github.com/ngrx/platform/blob/8.3.0/modules/store/src/action_creator.ts
 */

import {
  $$TYPE,
  Creator,
  DisallowTypeProperty,
  DispatchableCreator,
  FunctionWithParametersType,
  PropsReturnType,
  TypedDispatchable,
} from './models';

export function createDispatchable<T extends string>(
  $$type: string,
  type: T
): DispatchableCreator<T, () => TypedDispatchable<T>>;
export function createDispatchable<T extends string, P extends object>(
  $$type: string,
  type: T,
  config: { _as: 'props'; _p: P }
): DispatchableCreator<T, (props: P) => P & TypedDispatchable<T>>;
export function createDispatchable<
  T extends string,
  P extends any[],
  R extends object
  >(
  $$type: string,
  type: T,
  creator: Creator<P, DisallowTypeProperty<R>>
): FunctionWithParametersType<P, R & TypedDispatchable<T>> & TypedDispatchable<T>;
export function createDispatchable<T extends string, C extends Creator>(
  $$type: string,
  type: T,
  config?: { _as: 'props' } | C
): Creator {
  if (typeof config === 'function') {
    return defineType($$type, type, (...args: any[]) => ({
      ...config(...args),
      type,
    }));
  }
  const as = config ? config._as : 'empty';
  switch (as) {
    case 'empty':
      return defineType($$type, type, () => ({ type }));
    case 'props':
      return defineType($$type, type, (props: object) => ({
        ...props,
        type,
      }));
    default:
      throw new Error('Unexpected config.');
  }
}

export function props<P extends object>(): PropsReturnType<P> {
  // the return type does not match TypePropertyIsNotAllowed, so double casting
  // is used.
  return ({ _as: 'props', _p: undefined! } as unknown) as PropsReturnType<P>;
}

export function union<
  C extends { [key: string]: DispatchableCreator<string, Creator> }
  >(): ReturnType<C[keyof C]> {
  return undefined!;
}

function defineType($$type, type: string, creator: Creator): Creator {
  return Object.defineProperties(creator, {
    [$$TYPE]: {
      value: $$type,
      writable: false,
    },
    type: {
      value: type,
      writable: false,
    },
  });
}
