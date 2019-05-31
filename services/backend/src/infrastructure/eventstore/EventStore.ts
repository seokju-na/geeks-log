import Event from '../../domain/seed-work/Event';

export interface GetOptions {
  pageSize?: number;
  /**
   * @default 100000
   */
  timeout?: number;
}

export enum ExpectedVersion {
  Any = -2,
  NoStream = -1,
}

export interface SaveOptions {
  /**
   * @default ExpectedVersion.Any
   */
  expectedVersion?: ExpectedVersion | number;
}

export default interface EventStore {
  getById<E extends Event = Event>(streamId: string, options?: GetOptions): Promise<E[]>;

  save(streamId: string, events: Event[], options?: SaveOptions): Promise<void>;
}
