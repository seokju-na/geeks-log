import { Injectable } from '@nestjs/common';
import { Command, CommandExecutor, Event } from 'domain/core';
import { Subject } from 'rxjs';
import { InvalidCommandHandlerError, InvalidQueryHandlerError } from './internal-errors';
import { commandHandlerNotFoundException, queryHandlerNotFoundException } from './exceptions';
import { CommandHandler, Query, QueryHandler } from './interfaces';
import { COMMAND_HANDLER_METADATA_TOKEN, QUERY_HANDLER_METADATA_TOKEN } from './tokens';

interface HandlerWithType<T> {
  type: string;
  handler?: T;
}

@Injectable()
export class Cqrs {
  private readonly _commands = new Subject<Command>();
  private readonly _events = new Subject<Event[]>();
  private readonly _queries = new Subject<Query>();

  private readonly commandHandlers = new Map<string, CommandHandler>();
  private readonly queryHandlers = new Map<string, QueryHandler>();

  get commands() {
    return this._commands.asObservable();
  }

  get events() {
    return this._events.asObservable();
  }

  get queries() {
    return this._queries.asObservable();
  }

  async executeCommand<Executor extends CommandExecutor>(command: Command) {
    const handler = this.commandHandlers.get(command.type);

    if (handler === undefined) {
      throw commandHandlerNotFoundException();
    }

    this._commands.next(command);

    const events = await handler(command);
    this._events.next(events);

    return events as ReturnType<Executor>;
  }

  async executeQuery<Result>(query: Query) {
    const handler = this.queryHandlers.get(query.type);

    if (handler === undefined) {
      throw queryHandlerNotFoundException();
    }

    this._queries.next(query);

    const result = await handler(query);
    return result as Result;
  }

  _registerCommandHandlers(instances: object[] = []) {
    const handlers = instances
      .map(target =>
        this.reflectMetadataWithHandler<CommandHandler>(COMMAND_HANDLER_METADATA_TOKEN, target),
      )
      .reduce((a, b) => a.concat(b), []);

    handlers.forEach(({ handler, type }) => {
      if (typeof handler !== 'function') {
        throw new InvalidCommandHandlerError();
      }

      this.commandHandlers.set(type, handler);
    });
  }

  _registerQueryHandlers(instances: object[] = []) {
    const handlers = instances
      .map(target =>
        this.reflectMetadataWithHandler<QueryHandler>(QUERY_HANDLER_METADATA_TOKEN, target),
      )
      .reduce((a, b) => a.concat(b), []);

    handlers.forEach(({ handler, type }) => {
      if (typeof handler !== 'function') {
        throw new InvalidQueryHandlerError();
      }

      this.queryHandlers.set(type, handler);
    });
  }

  private reflectMetadataWithHandler<T>(
    metadataToken: string,
    instance: object,
  ): HandlerWithType<T>[] {
    if (!instance) {
      return [];
    }

    return Object.entries(instance)
      .filter(
        ([, handler]) => typeof handler === 'function' && handler.hasOwnProperty(metadataToken),
      )
      .map(([, handler]) => {
        const type = handler[metadataToken] as string;
        return {
          type,
          handler: typeof handler === 'function' ? handler.bind(instance) : undefined,
        };
      });
  }
}
