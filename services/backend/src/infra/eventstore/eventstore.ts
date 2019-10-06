import { Observable } from 'rxjs';

export interface EventLike {
  type: string;
  payload: any;
}

export const EVENTSTORE_TOKEN = 'infra.eventstore.EVENTSTORE';

export interface GetOptions {
  pageSize?: number;
  /**
   * @default 100000
   */
  timeout?: number;
  /** @default 0 */
  fromEventNumber?: number;
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

export interface SaveResult {
  firstEventNumber: number;
  lastEventNumber: number;
  commitPosition: number;
}

export interface Eventstore {
  getById(streamId: string, options?: GetOptions): Promise<EventLike[]>;

  save(streamId: string, events: EventLike[], options?: SaveOptions): Promise<SaveResult>;

  streamAsObservable(streamId: string): Observable<EventLike>;
}
