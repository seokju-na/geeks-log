import { $$TYPE, createDispatchable, props } from '../src';

describe('dispatchable', () => {
  test('should $$type equals', () => {
    const pizzaActionCreator = createDispatchable('action', 'PIZZA', props<{ name: string }>());

    expect(pizzaActionCreator[$$TYPE]).toEqual('action');
    expect(pizzaActionCreator.type).toEqual('PIZZA');

    const pizzaAction = pizzaActionCreator({ name: 'cheese' });

    expect(pizzaAction.type).toEqual('PIZZA');
    expect(pizzaAction.name).toEqual('cheese');
  });
});
