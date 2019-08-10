import { InfraException } from '../shared';

export enum CqrsExceptionCodes {
  COMMAND_HANDLER_NOT_FOUND = 'infra.cqrs.commandHandlerNotFound',
  QUERY_HANDLER_NOT_FOUND = 'infra.cqrs.queryHandlerNotFound',
}

export function commandHandlerNotFoundException() {
  return new InfraException(CqrsExceptionCodes.COMMAND_HANDLER_NOT_FOUND);
}

export function queryHandlerNotFoundException() {
  return new InfraException(CqrsExceptionCodes.QUERY_HANDLER_NOT_FOUND);
}
