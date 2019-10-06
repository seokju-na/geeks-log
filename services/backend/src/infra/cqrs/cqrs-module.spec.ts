import { props } from '@geeks-log/event-system';
import { fakeAsync, flush } from '@geeks-log/testing';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createCommand, createEvent } from 'domain/core';
import { map } from 'rxjs/operators';
import { InfraException, isInfraException } from '../shared';
import { Cqrs } from './cqrs';
import { CqrsModule } from './cqrs-module';
import { createCommandHandler, createSaga } from './creators';
import { CqrsExceptionCodes } from './exceptions';
import { ofEventType } from './operators';

const fooCommand = createCommand('foo', props<{ value: string }>());
const barCommand = createCommand('bar', props<{ value: string }>());
const notRegisteredCommand = createCommand('noteRegistered');

const fooEvent = createEvent('foo', props<{ value: string }>());
const barEvent = createEvent('bar', props<{ value: string }>());

@Injectable()
class FooAndBarCommandHandler {
  readonly handleFoo = createCommandHandler(fooCommand, async command => {
    return [fooEvent({ value: command.value })];
  });

  readonly handlerBar = createCommandHandler(barCommand, async command => {
    return [barEvent({ value: command.value })];
  });
}

@Injectable()
class FooAndBarSagas {
  readonly barOnFoo = createSaga(events =>
    events.pipe(
      ofEventType(fooEvent),
      map(event => {
        console.log('saga', event);
        return barCommand({ value: event.value });
      }),
    ),
  );
}

describe('infra.cqrs', () => {
  let cqrs: Cqrs;

  describe('Cqrs', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [
          CqrsModule.initialize({
            commandHandlers: [FooAndBarCommandHandler],
            sagas: [],
            queryHandlers: [],
          }),
        ],
      }).compile();

      module.get(CqrsModule).onModuleInit();
      cqrs = module.get(Cqrs);
    });

    test('should returns events after execute command.', async () => {
      let events = await cqrs.executeCommand(fooCommand({ value: 'foo' }));
      expect(events[0].type).toEqual('foo');

      events = await cqrs.executeCommand(barCommand({ value: 'bar' }));
      expect(events[0].type).toEqual('bar');
    });

    test('should receive command(s) from observable.', async () => {
      const spy = jest.fn();
      const subscription = cqrs.commands.subscribe(spy);

      const command = fooCommand({ value: 'foo' });
      await cqrs.executeCommand(command);

      expect(spy).toHaveBeenCalledWith(command);
      subscription.unsubscribe();
    });

    test('should throw exception if handler is not registered.', async () => {
      const command = notRegisteredCommand();
      let error;

      try {
        await cqrs.executeCommand(command);
      } catch (err) {
        error = err;
      }

      expect(isInfraException(error)).toBe(true);
      expect((error as InfraException).code).toEqual(CqrsExceptionCodes.COMMAND_HANDLER_NOT_FOUND);
    });
  });

  xdescribe('Saga', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [
          CqrsModule.initialize({
            commandHandlers: [FooAndBarCommandHandler],
            queryHandlers: [],
            sagas: [FooAndBarSagas],
          }),
        ],
      }).compile();

      module.get(CqrsModule).onModuleInit();
      cqrs = module.get(Cqrs);
    });

    test('should works', fakeAsync(() => {
      const commandSpy = jest.fn();
      const eventsSpy = jest.fn();

      const sub1 = cqrs.commands.subscribe(commandSpy);
      const sub2 = cqrs.events.subscribe(eventsSpy);

      cqrs.executeCommand(fooCommand({ value: 'foo' }));
      flush();

      sub1.unsubscribe();
      sub2.unsubscribe();
    }));
  });
});
