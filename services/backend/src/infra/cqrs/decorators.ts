import { Type } from '@nestjs/common';
import 'reflect-metadata';
import { Command } from '../../domain/core';
import {
  COMMAND_HANDLER_METADATA_TOKEN,
  QUERY_HANDLER_METADATA_TOKEN,
  SAGA_METADATA_TOKEN,
} from './constants';
import {
  CommandHandlerMetadata,
  Query,
  QueryHandlerMetadata,
  SagaMetadata,
  SagaOptions,
} from './interfaces';

export const CommandHandler = (command: Type<Command>): PropertyDecorator => {
  return (target, propertyKey) => {
    const metadataList = Reflect.getMetadata(COMMAND_HANDLER_METADATA_TOKEN, target.constructor)
      || [];
    const metadata: CommandHandlerMetadata = {
      propertyKey,
      commandName: command.name,
    };

    Reflect.defineMetadata(
      COMMAND_HANDLER_METADATA_TOKEN,
      [...metadataList, metadata],
      target.constructor,
    );
  };
};

export const Saga = (options: SagaOptions = { dispatchCommand: true }): PropertyDecorator => {
  return (target, propertyKey) => {
    const metadataList = Reflect.getMetadata(SAGA_METADATA_TOKEN, target.constructor) || [];
    const metadata: SagaMetadata = { propertyKey, options };

    Reflect.defineMetadata(
      SAGA_METADATA_TOKEN,
      [...metadataList, metadata],
      target.constructor,
    );
  };
};

export const QueryHandler = (query: Type<Query>): PropertyDecorator => {
  return (target, propertyKey) => {
    const metadataList = Reflect
      .getMetadata(QUERY_HANDLER_METADATA_TOKEN, target.constructor) || [];

    const metadata: QueryHandlerMetadata = {
      propertyKey,
      queryName: query.name,
    };

    Reflect.defineMetadata(
      QUERY_HANDLER_METADATA_TOKEN,
      [...metadataList, metadata],
      target.constructor,
    );
  };
};
