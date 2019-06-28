import { Observable } from 'rxjs';
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

export default interface Eventstore {
  getById(streamId: string, options?: GetOptions): Promise<Event[]>;

  save(streamId: string, events: Event[], options?: SaveOptions): Promise<void>;

  stream(streamId: string): Observable<Event>;
}
