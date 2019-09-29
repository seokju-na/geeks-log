/**
 * Source are taken from ngrx library and modified a bit.
 * See: https://github.com/ngrx/platform/blob/8.3.0/modules/store/src/reducer_creator.ts
 */

import { Dispatchable, DispatchableCreator, DispatchableType, Reducer } from './models';

export interface On<S> {
  reducer: Reducer<S>;
  types: string[];
}

// Specialized Reducer that is aware of the Action type it needs to handle
export interface OnReducer<S, C extends DispatchableCreator[]> {
  (state: S, action: DispatchableType<C[number]>): S;
}

export function on<C1 extends DispatchableCreator, S>(
  creator1: C1,
  reducer: OnReducer<S, [C1]>
): On<S>;
export function on<C1 extends DispatchableCreator, C2 extends DispatchableCreator, S>(
  creator1: C1,
  creator2: C2,
  reducer: OnReducer<S, [C1, C2]>
): On<S>;
export function on<
  C1 extends DispatchableCreator,
  C2 extends DispatchableCreator,
  C3 extends DispatchableCreator,
  S
  >(
  creator1: C1,
  creator2: C2,
  creator3: C3,
  reducer: OnReducer<S, [C1, C2, C3]>
): On<S>;
export function on<
  C1 extends DispatchableCreator,
  C2 extends DispatchableCreator,
  C3 extends DispatchableCreator,
  C4 extends DispatchableCreator,
  S
  >(
  creator1: C1,
  creator2: C2,
  creator3: C3,
  creator4: C4,
  reducer: OnReducer<S, [C1, C2, C3, C4]>
): On<S>;
export function on<
  C1 extends DispatchableCreator,
  C2 extends DispatchableCreator,
  C3 extends DispatchableCreator,
  C4 extends DispatchableCreator,
  C5 extends DispatchableCreator,
  S
  >(
  creator1: C1,
  creator2: C2,
  creator3: C3,
  creator4: C4,
  creator5: C5,
  reducer: OnReducer<S, [C1, C2, C3, C4, C5]>
): On<S>;
export function on<
  C1 extends DispatchableCreator,
  C2 extends DispatchableCreator,
  C3 extends DispatchableCreator,
  C4 extends DispatchableCreator,
  C5 extends DispatchableCreator,
  C6 extends DispatchableCreator,
  S
  >(
  creator1: C1,
  creator2: C2,
  creator3: C3,
  creator4: C4,
  creator5: C5,
  creator6: C6,
  reducer: OnReducer<S, [C1, C2, C3, C4, C5, C6]>
): On<S>;
export function on<
  C1 extends DispatchableCreator,
  C2 extends DispatchableCreator,
  C3 extends DispatchableCreator,
  C4 extends DispatchableCreator,
  C5 extends DispatchableCreator,
  C6 extends DispatchableCreator,
  C7 extends DispatchableCreator,
  S
  >(
  creator1: C1,
  creator2: C2,
  creator3: C3,
  creator4: C4,
  creator5: C5,
  creator6: C6,
  creator7: C7,
  reducer: OnReducer<S, [C1, C2, C3, C4, C5, C6, C7]>
): On<S>;
export function on<
  C1 extends DispatchableCreator,
  C2 extends DispatchableCreator,
  C3 extends DispatchableCreator,
  C4 extends DispatchableCreator,
  C5 extends DispatchableCreator,
  C6 extends DispatchableCreator,
  C7 extends DispatchableCreator,
  C8 extends DispatchableCreator,
  S
  >(
  creator1: C1,
  creator2: C2,
  creator3: C3,
  creator4: C4,
  creator5: C5,
  creator6: C6,
  creator7: C7,
  creator8: C8,
  reducer: OnReducer<S, [C1, C2, C3, C4, C5, C6, C7, C8]>
): On<S>;
export function on<
  C1 extends DispatchableCreator,
  C2 extends DispatchableCreator,
  C3 extends DispatchableCreator,
  C4 extends DispatchableCreator,
  C5 extends DispatchableCreator,
  C6 extends DispatchableCreator,
  C7 extends DispatchableCreator,
  C8 extends DispatchableCreator,
  C9 extends DispatchableCreator,
  S
  >(
  creator1: C1,
  creator2: C2,
  creator3: C3,
  creator4: C4,
  creator5: C5,
  creator6: C6,
  creator7: C7,
  creator8: C8,
  creator9: C9,
  reducer: OnReducer<S, [C1, C2, C3, C4, C5, C6, C7, C8, C9]>
): On<S>;
export function on<
  C1 extends DispatchableCreator,
  C2 extends DispatchableCreator,
  C3 extends DispatchableCreator,
  C4 extends DispatchableCreator,
  C5 extends DispatchableCreator,
  C6 extends DispatchableCreator,
  C7 extends DispatchableCreator,
  C8 extends DispatchableCreator,
  C9 extends DispatchableCreator,
  C10 extends DispatchableCreator,
  S
  >(
  creator1: C1,
  creator2: C2,
  creator3: C3,
  creator4: C4,
  creator5: C5,
  creator6: C6,
  creator7: C7,
  creator8: C8,
  creator9: C9,
  creator10: C10,
  reducer: OnReducer<S, [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]>
): On<S>;
export function on<S>(
  creator: DispatchableCreator,
  ...rest: (DispatchableCreator | OnReducer<S, [DispatchableCreator]>)[]
): On<S>;
export function on(
  ...args: (DispatchableCreator | Function)[]
): { reducer: Function; types: string[] } {
  const reducer = args.pop() as Function;
  const types = args.reduce(
    (result, creator) => [...result, (creator as DispatchableCreator).type],
    [] as string[]
  );
  return { reducer, types };
}

export function createReducer<S, A extends Dispatchable = Dispatchable>(
  initialState: S,
  ...ons: On<S>[]
): Reducer<S, A> {
  const map = new Map<string, Reducer<S, A>>();
  for (const on of ons) {
    for (const type of on.types) {
      map.set(type, on.reducer);
    }
  }

  return function(state: S = initialState, action: A): S {
    const reducer = map.get(action.type);
    return reducer ? reducer(state, action) : state;
  };
}
