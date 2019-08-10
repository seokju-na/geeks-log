import { fakeAsync, flush, tick } from '@geeks-log/testing';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { delay, map } from 'rxjs/operators';
import { Command, DomainEvent } from '../../domain/core';
import { InfraException, isInfraException } from '../shared';
import { Cqrs } from './cqrs';
import { CqrsModule } from './cqrs-module';
import { CommandHandler, Saga } from './decorators';
import { CqrsExceptionCodes } from './exceptions';
import { ISaga } from './interfaces';
import { ofEventType } from './operators';

class FooCommand extends Command {
  public readonly name = 'foo';
  public payload: any;

  constructor() {
    super();
  }
}

class BarCommand extends Command {
  public readonly name = 'bar';
  public payload: any;

  constructor() {
    super();
  }
}

class NotRegisteredCommand extends Command {
  constructor() {
    super();
  }
}

interface FooEvent extends DomainEvent {
  type: 'foo';
  payload: any;
}

// noinspection JSUnusedLocalSymbols
interface BarEvent extends DomainEvent {
  type: 'bar';
  payload: any;
}

@Injectable()
class FooAndBarCommandHandler {
  @CommandHandler(FooCommand)
  async handleFoo(command: FooCommand) {
    return [
      {
        type: 'foo',
        payload: command.payload,
      },
    ];
  }

  @CommandHandler(BarCommand)
  async handleBar(command: BarCommand) {
    return [
      {
        type: 'bar',
        payload: command.payload,
      },
    ];
  }
}

@Injectable()
class FooAndBarSagas {
  @Saga()
  barOnFoo: ISaga = events => events.pipe(
    ofEventType('foo'),
    delay(100),
    map((event: FooEvent) => {
      const command = new BarCommand();
      command.payload = event.payload;

      return command;
    }),
  );
}

describe('infra.cqrs', () => {
  let cqrs: Cqrs;

  describe('Cqrs', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [CqrsModule],
        providers: [FooAndBarCommandHandler],
      }).compile();

      module.get(CqrsModule).onModuleInit();
      cqrs = module.get(Cqrs);
    });

    test('should returns events after execute command.', async () => {
      let command: any = new FooCommand();
      let events = await cqrs.executeCommand(command);
      expect(events[0].type).toEqual('foo');

      command = new BarCommand();
      events = await cqrs.executeCommand(command);
      expect(events[0].type).toEqual('bar');
    });

    test('should receive command(s) from observable.', async () => {
      const spy = jest.fn();
      const subscription = cqrs.commands.subscribe(spy);

      const command = new FooCommand();
      await cqrs.executeCommand(command);

      expect(spy).toHaveBeenCalledWith(command);
      subscription.unsubscribe();
    });

    test('should throw exception if handler is not registered.', async () => {
      const command = new NotRegisteredCommand();
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
        imports: [CqrsModule],
        providers: [FooAndBarCommandHandler, FooAndBarSagas],
      }).compile();

      module.get(CqrsModule).onModuleInit();
      cqrs = module.get(Cqrs);
    });

    test('should works', fakeAsync(() => {
      const commandSpy = jest.fn();
      const eventsSpy = jest.fn();

      const sub1 = cqrs.commands.subscribe(commandSpy);
      const sub2 = cqrs.events.subscribe(eventsSpy);

      const command = new FooCommand();
      cqrs.executeCommand(command);
      flush();

      tick(100);
      flush();

      console.log(commandSpy.mock.calls);

      sub1.unsubscribe();
      sub2.unsubscribe();
    }));
  });
});
