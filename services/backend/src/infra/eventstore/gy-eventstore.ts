/// <reference path="../../../node_modules/event-store-client/event-store-client.d.ts"/>
import { Provider } from '@nestjs/common';
import {
  Connection,
  Event as GYEvent,
  ICredentials,
  IReadStreamEventsCompleted,
  IWriteEventsCompleted,
  OperationResult,
  ReadStreamResult,
  StoredEvent,
} from 'event-store-client';
import { EMPTY, Observable } from 'rxjs';
import { expand, last, map, scan, timeout } from 'rxjs/operators';
import { createId } from 'domain/core';
import environment from '../../environment';
import {
  EventLike,
  Eventstore,
  EVENTSTORE_TOKEN,
  ExpectedVersion,
  GetOptions,
  SaveOptions,
  SaveResult,
} from './eventstore';
import { streamDeletedException, streamNotFoundException } from './exceptions';

const noop = () => {};

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
  fromEventNumber?: number;
}

interface InternalWriteOptions {
  expectedVersion?: number;
  /**
   * If this request must be processed by the master server in the cluster
   * @default false
   */
  requireMaster?: boolean;
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
export class GYEventstore implements Eventstore {
  private readonly connection: Connection;
  private readonly credentials: ICredentials;

  constructor({
    connectOptions: { host = 'localhost', port = 1113, debug = false } = {},
    credentials,
  }: ConstructOptions) {
    this.connection = new Connection({ host, port, debug });
    this.credentials = { ...credentials };
  }

  /**
   * Get all events from given stream.
   */
  getById(streamId: string, options?: GetOptions) {
    const { pageSize, timeout: timeoutDue, fromEventNumber } = withDefaultGetOptions(options);

    const reduceAllEvents = this.readAllStreamEventsForward(streamId, {
      pageSize,
      eachTimeout: timeoutDue,
      fromEventNumber,
    }).pipe(
      scan<EventLike[]>((accumulation, events) => accumulation.concat(events), []),
      last(),
    );

    return reduceAllEvents.toPromise();
  }

  async save(streamId: string, events: EventLike[], options?: SaveOptions) {
    const { expectedVersion } = withDefaultSaveOptions(options);

    const eventsPayload: GYEvent[] = events.map(event => ({
      eventId: createId(),
      eventType: event.type,
      data: event.payload,
      metadata: {},
    }));

    return await this.writeStreamEvents(streamId, eventsPayload, {
      expectedVersion,
    });
  }

  streamAsObservable(streamId: string) {
    return this.subscribeToStream(streamId);
  }

  private readAllStreamEventsForward(
    streamId: string,
    options: InternalMultipleReadOptions,
  ): Observable<EventLike[]> {
    const { pageSize, eachTimeout, fromEventNumber } = options;

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
      result.events.map(
        (event: GYEvent) =>
          ({
            type: event.eventType,
            payload: event.data,
          } as EventLike),
      );

    return this.readStreamEventsForward(streamId, fromEventNumber, {
      maxCount: pageSize,
      timeout: eachTimeout,
    }).pipe(
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

    const task = new Observable<IReadStreamEventsCompleted>(observer => {
      function handleResult(completed: IReadStreamEventsCompleted) {
        const { result, error } = completed;

        if (result === ReadStreamResult.Success) {
          observer.next(completed);
          observer.complete();
        } else if (result === ReadStreamResult.NoStream) {
          observer.error(streamNotFoundException());
        } else if (result === ReadStreamResult.StreamDeleted) {
          observer.error(streamDeletedException());
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
  ) {
    const { expectedVersion = ExpectedVersion.Any, requireMaster = false } = options;

    return new Promise<SaveResult>((resolve, reject) => {
      function handleResult(completed: IWriteEventsCompleted) {
        const { result, message } = completed;

        if (result === OperationResult.Success) {
          const { firstEventNumber, lastEventNumber, commitPosition } = completed;

          resolve({
            firstEventNumber,
            lastEventNumber,
            commitPosition,
          });
        } else if (result === OperationResult.StreamDeleted) {
          reject(streamDeletedException());
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

  private subscribeToStream(streamId: string) {
    return new Observable<EventLike>(observer => {
      const onEventAppeared = (event: StoredEvent) => {
        observer.next({
          type: event.eventType,
          payload: event.data,
        });
      };

      const id = this.connection.subscribeToStream(
        streamId,
        true,
        onEventAppeared,
        noop,
        noop,
        this.credentials,
        noop,
      );

      return () => {
        this.connection.unsubscribeFromStream(id, this.credentials, noop);
      };
    });
  }
}

export function provideGYEventstore(): Provider {
  return {
    provide: EVENTSTORE_TOKEN,
    useFactory() {
      return new GYEventstore({
        connectOptions: {
          host: environment.eventstore.host,
          port: environment.eventstore.port,
        },
        credentials: {
          username: environment.eventstore.username,
          password: environment.eventstore.password,
        },
      });
    },
  };
}

function withDefaultGetOptions(options?: GetOptions): GetOptions {
  return {
    pageSize: 100,
    timeout: 10000,
    fromEventNumber: 0,
    ...options,
  };
}

function withDefaultSaveOptions(options?: SaveOptions): SaveOptions {
  return {
    expectedVersion: ExpectedVersion.Any,
    ...options,
  };
}
