import { Observable } from 'rxjs';
import { DomainEvent } from '../../domain/core';

export const EVENTSTORE_TOKEN = 'infra.eventstore.EVENTSTORE';

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

export interface Eventstore {
  getById(streamId: string, options?: GetOptions): Promise<DomainEvent[]>;

  save(streamId: string, events: DomainEvent[], options?: SaveOptions): Promise<void>;

  streamAsObservable(streamId: string): Observable<DomainEvent>;
}
