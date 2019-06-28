import EventstoreException from './EventstoreException';

export function throwStreamDeletedException() {
  return new EventstoreException('eventstore.streamDeleted');
}

export function throwStreamNotFoundException() {
  return new EventstoreException('eventstore.streamNotFound');
}
