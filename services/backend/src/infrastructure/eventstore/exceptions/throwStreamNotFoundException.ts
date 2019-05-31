import EventStoreException from '../seed-work/EventStoreException';

export default function throwStreamNotFoundException() {
  return new EventStoreException('eventstore.streamNotFound');
}
