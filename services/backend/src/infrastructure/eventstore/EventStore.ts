import Event from '../../domain/seed-work/Event';

export interface SaveOptions {
  expectedVersion?: number;
}

export default interface EventStore {
  getById<E extends Event = Event>(streamId: string): Promise<E[]>;

  save(streamId: string, events: Event[], options?: SaveOptions): Promise<void>;
}
