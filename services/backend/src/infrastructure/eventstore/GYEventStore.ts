/// <reference path="../../../node_modules/event-store-client/event-store-client.d.ts"/>
import {
  Connection,
  Event as GYEvent,
  ICredentials,
  IReadStreamEventsCompleted,
  IWriteEventsCompleted,
  OperationResult,
  ReadStreamResult,
} from 'event-store-client';
import { EMPTY, Observable } from 'rxjs';
import { expand, last, map, scan, timeout } from 'rxjs/operators';
import Event from '../../domain/seed-work/Event';
import generateUniqueId from '../../domain/shared/utils/generateUniqueId';
import toPromise from '../../utils/toPromise';
import EventStore, {
  ExpectedVersion,
  GetOptions,
  SaveOptions as BaseSaveOptions,
} from './EventStore';
import throwStreamDeletedException from './exceptions/throwStreamDeletedException';
import throwStreamNotFoundException from './exceptions/throwStreamNotFoundException';

const noop = () => {
};

interface InternalSingleReadOptions {
  /**
   * The maximum number of events to return (counting up from fromEventNumber)
   * @default 100
   */
  maxCount?: number;
  /**
   * If links to events from other streams should be resolved (ie: for events re-published by a
   * projection)
   * @default true
   */
  resolveLinkTos?: boolean;
  /**
   * If this request must be processed by the master server in the cluster
   * @default false
   */
  requireMaster?: boolean;
  timeout?: number;
}

interface InternalMultipleReadOptions {
  /**
   * The maximum number of events to return (counting up from fromEventNumber)
   * @default 100
   */
  pageSize?: number;
  eachTimeout?: number;
  totalTimeout?: number;
}

interface InternalWriteOptions {
  expectedVersion?: number;
  /**
   * If this request must be processed by the master server in the cluster
   * @default false
   */
  requireMaster?: boolean;
}

export interface SaveOptions extends BaseSaveOptions {
}

interface ConstructOptions {
  connectOptions?: {
    /**
     * The domain name or IP address of the Event Store server.
     * @default localhost
     */
    host?: string;
    /**
     * The port number to use
     * @default 1113
     */
    port?: number;
    /**
     * @default false
     */
    debug?: boolean;
  };
  credentials: ICredentials;
}

/**
 * Implements of EventStoreInterface with Greg Young's Event Store (https://eventstore.org)
 */
export default class GYEventStore implements EventStore {
  private readonly connection: Connection;
  private readonly credentials: ICredentials;

  constructor({
    connectOptions: {
      host = 'localhost',
      port = 1113,
      debug = false,
    } = {},
    credentials,
  }: ConstructOptions) {
    this.connection = new Connection({ host, port, debug });
    this.credentials = { ...credentials };
  }

  /**
   * Get all events from given stream.
   */
  getById<E extends Event = Event>(streamId: string, options?: GetOptions): Promise<E[]> {
    const { pageSize, timeout: timeoutDue } = withDefaultGetOptions(options);

    const reduceAllEvents = this.readAllStreamEventsForward<E>(streamId, {
      pageSize,
      eachTimeout: timeoutDue,
    }).pipe(
      scan((accumulation, events) => accumulation.concat(events), [] as E[]),
      last(),
    );

    return toPromise(reduceAllEvents);
  }

  async save(streamId: string, events: Event[], options?: SaveOptions) {
    const { expectedVersion } = withDefaultSaveOptions(options);

    const eventsPayload: GYEvent[] = events.map(event => ({
      eventId: generateUniqueId(),
      eventType: event.type,
      data: event.payload,
      metadata: {},
    }));

    await this.writeStreamEvents(streamId, eventsPayload, { expectedVersion });
  }

  private readAllStreamEventsForward<E extends Event = Event>(
    streamId: string,
    options: InternalMultipleReadOptions = {},
  ): Observable<E[]> {
    const {
      pageSize = 100,
      eachTimeout = 10000,
    } = options;

    const readNextIfExists = ({ isEndOfStream, nextEventNumber }: IReadStreamEventsCompleted) => {
      const hasNext = !isEndOfStream && nextEventNumber >= 0;

      return hasNext
        ? this.readStreamEventsForward(streamId, nextEventNumber, {
          maxCount: pageSize,
          timeout: eachTimeout,
        })
        : EMPTY;
    };

    const parseEvents = (result: IReadStreamEventsCompleted) =>
      result.events.map((event: GYEvent) => ({
        type: event.eventType,
        payload: event.data,
      } as E));

    return this
      .readStreamEventsForward(streamId, 0, {
        maxCount: pageSize,
        timeout: eachTimeout,
      })
      .pipe(
        expand(readNextIfExists),
        map(parseEvents),
      );
  }

  private readStreamEventsForward(
    streamId: string,
    fromEventNumber: number,
    options: InternalSingleReadOptions = {},
  ): Observable<IReadStreamEventsCompleted> {
    const {
      maxCount = 100,
      resolveLinkTos = true,
      requireMaster = false,
      timeout: timeoutDue = 10000,
    } = options;

    const task = new Observable<IReadStreamEventsCompleted>((observer) => {
      function handleResult(completed: IReadStreamEventsCompleted) {
        const { result, error } = completed;

        if (result === ReadStreamResult.Success) {
          observer.next(completed);
          observer.complete();
        } else if (result === ReadStreamResult.NoStream) {
          observer.error(throwStreamNotFoundException());
        } else if (result === ReadStreamResult.StreamDeleted) {
          observer.error(throwStreamDeletedException());
        } else {
          observer.error(error);
        }
      }

      this.connection.readStreamEventsForward(
        streamId,
        fromEventNumber,
        maxCount,
        resolveLinkTos,
        requireMaster,
        noop,
        this.credentials,
        handleResult,
      );
    });

    return task.pipe(timeout(timeoutDue));
  }

  private writeStreamEvents(
    streamId: string,
    events: GYEvent[],
    options: InternalWriteOptions = {},
  ): Promise<void> {
    const {
      expectedVersion = ExpectedVersion.Any,
      requireMaster = false,
    } = options;

    return new Promise((resolve, reject) => {
      function handleResult(completed: IWriteEventsCompleted) {
        const { result, message } = completed;

        if (result === OperationResult.Success) {
          resolve();
        } else if (result === OperationResult.StreamDeleted) {
          reject(throwStreamDeletedException());
        } else {
          reject(message);
        }
      }

      this.connection.writeEvents(
        streamId,
        expectedVersion,
        requireMaster,
        events,
        this.credentials,
        handleResult,
      );
    });
  }
}

function withDefaultGetOptions(options?: GetOptions): GetOptions {
  return {
    pageSize: 100,
    timeout: 10000,
    ...options,
  };
}

function withDefaultSaveOptions(options?: SaveOptions): SaveOptions {
  return {
    expectedVersion: ExpectedVersion.Any,
    ...options,
  };
}
