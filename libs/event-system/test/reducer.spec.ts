import { createDispatchable, createReducer, props, on } from '../src';

describe('reducer', () => {
  test('should work', () => {
    const pizzaAction = createDispatchable('action', 'PIZZA', props<{ name: string }>());
    const riceAction = createDispatchable('action', 'RICE', props<{ name: string }>());

    interface State {
      pizza: string | null;
      rice: string | null;
    }

    const reducer = createReducer<State>({ pizza: null, rice: null },
      on(pizzaAction, (state, action) => ({
        ...state,
        pizza: action.name,
      })),
      on(riceAction, (state, action) => ({
        ...state,
        rice: action.name,
      })),
    );

    const beforeState = reducer(undefined, pizzaAction({ name: 'cheese' }));
    expect(beforeState).toEqual({ pizza: 'cheese', rice: null });

    const afterState = reducer(beforeState, riceAction({ name: 'white' }));
    expect(afterState).toEqual({ pizza: 'cheese', rice: 'white' });
  });
});
