import EventStoreException from '../seed-work/EventStoreException';

export default function throwStreamDeletedException() {
  return new EventStoreException('eventstore.streamDeleted');
}
