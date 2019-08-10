import { Observable } from 'rxjs';
import { Command, DomainEvent } from '../../domain/core';

export type ISaga = (events: Observable<DomainEvent>) => Observable<any>;

export type ICommandHandler = (command: Command) => Promise<DomainEvent[]>;

export abstract class Query {
}

export function isQuery(query: unknown): query is Query {
  if (typeof query !== 'object' || query == null) {
    return false;
  }

  return Object.getPrototypeOf(query.constructor.prototype) === Query.prototype;
}

export type IQueryHandler<Q extends Query = Query, R = any> = (query: Q) => Promise<R>;

export interface BaseMetadata {
  propertyKey: string | symbol;
}

export interface CommandHandlerMetadata extends BaseMetadata {
  commandName: string;
}

export interface SagaOptions {
  /** @default true */
  dispatchCommand?: boolean;
}

export interface SagaMetadata extends BaseMetadata {
  options: SagaOptions;
}

export interface QueryHandlerMetadata extends BaseMetadata {
  queryName: string;
}
