import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Subject } from 'rxjs';
import { Command, CommandExecutor, DomainEvent, ReturnEventsOf } from '../../domain/core';
import { COMMAND_HANDLER_METADATA_TOKEN, QUERY_HANDLER_METADATA_TOKEN } from './constants';
import { InvalidCommandHandlerError, InvalidQueryHandlerError } from './errors';
import { commandHandlerNotFoundException, queryHandlerNotFoundException } from './exceptions';
import {
  BaseMetadata,
  CommandHandlerMetadata,
  ICommandHandler,
  IQueryHandler,
  Query,
  QueryHandlerMetadata,
} from './interfaces';

type WithHandler<T extends BaseMetadata> = T & { handler: ICommandHandler };

@Injectable()
export class Cqrs {
  private readonly _commands = new Subject<Command>();
  private readonly _events = new Subject<DomainEvent[]>();
  private readonly _queries = new Subject<Query>();
  private readonly commandHandlers = new Map<string, ICommandHandler>();
  private readonly queryHandlers = new Map<string, IQueryHandler>();

  constructor(private readonly moduleRef: ModuleRef) {
  }

  get commands() {
    return this._commands.asObservable();
  }

  get events() {
    return this._events.asObservable();
  }

  get queries() {
    return this._queries.asObservable();
  }

  async executeCommand<Executor extends CommandExecutor, C extends Command = Command>(command: C) {
    const handler = this.commandHandlers.get(this.getCommandOrQueryName(command));

    if (handler === undefined) {
      throw commandHandlerNotFoundException();
    }

    this._commands.next(command);

    const events = await handler(command);
    this._events.next(events);

    return events as ReturnEventsOf<Executor>;
  }

  async executeQuery<Result = any, Q extends Query = Query>(query: Q) {
    const handler = this.queryHandlers.get(this.getCommandOrQueryName(query));

    if (handler === undefined) {
      throw queryHandlerNotFoundException();
    }

    this._queries.next(query);

    const result = await handler(query);
    return result as Result;
  }

  _registerCommandHandlers(types: Type<any>[] = []) {
    const handlers = types
      .map(target => this.reflectMetadataWithHandler<CommandHandlerMetadata>(
        COMMAND_HANDLER_METADATA_TOKEN,
        target,
      ))
      .reduce((a, b) => a.concat(b), []);

    handlers.forEach(({ handler, commandName }) => {
      if (typeof handler !== 'function') {
        throw new InvalidCommandHandlerError();
      }

      this.commandHandlers.set(commandName, handler);
    });
  }

  _registerQueryHandlers(types: Type<any>[] = []) {
    const handlers = types
      .map(target => this.reflectMetadataWithHandler<QueryHandlerMetadata>(
        QUERY_HANDLER_METADATA_TOKEN,
        target,
      ))
      .reduce((a, b) => a.concat(b), []);

    handlers.forEach(({ handler, queryName }) => {
      if (typeof handler !== 'function') {
        throw new InvalidQueryHandlerError();
      }

      this.queryHandlers.set(queryName, handler);
    });
  }

  private getCommandOrQueryName(commandOrQuery: Command | Query) {
    const { constructor } = Object.getPrototypeOf(commandOrQuery);
    return constructor.name as string;
  }

  private reflectMetadataWithHandler<T extends BaseMetadata>(
    metadataToken: string,
    target: Type<any>,
  ): WithHandler<T>[] {
    const metadata: T[] = Reflect.getMetadata(metadataToken, target) || [];
    const instance = this.moduleRef.get(target, { strict: false });

    if (!instance) {
      return [];
    }

    return metadata.map(m => {
      const method = instance[m.propertyKey];

      return {
        ...m,
        handler: typeof method === 'function' ? method.bind(instance) : undefined,
      };
    });
  }
}
