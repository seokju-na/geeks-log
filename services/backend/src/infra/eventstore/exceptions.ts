import { InfraException } from '../shared';

export enum EventstoreExceptionCodes {
  STREAM_DELETED = 'infra.eventstore.streamDeleted',
  STREAM_NOT_FOUND = 'infra.eventstore.streamNotFound',
}

export function streamDeletedException() {
  return new InfraException(EventstoreExceptionCodes.STREAM_DELETED);
}

export function streamNotFoundException() {
  return new InfraException(EventstoreExceptionCodes.STREAM_NOT_FOUND);
}
