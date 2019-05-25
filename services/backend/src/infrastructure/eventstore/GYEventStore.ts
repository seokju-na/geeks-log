import axios, { AxiosInstance } from 'axios';
import { BehaviorSubject, from } from 'rxjs';
import { concatMap, last, map, scan, tap } from 'rxjs/operators';
import Event from '../../domain/seed-work/Event';
import generateUniqueId from '../../domain/shared/utils/generateUniqueId';
import toPromise from '../../utils/toPromise';
import EventStore, { SaveOptions as BaseSaveOptions } from './EventStore';

interface WriteEventPayload {
  eventId: string;
  eventType: string;
  data: object;
  metadata?: object;
}

type WriteEventsPayload = WriteEventPayload[];

export interface SaveOptions extends BaseSaveOptions {
}

interface ConstructOptions {
  url: string;
}

// Response types
interface Author {
  name: string;
}

type StreamLinkRelation = 'self' | 'first' | 'last' | 'previous' | 'next' | 'metadata';
type EventLinkRelation = 'edit' | 'alternate';

interface StreamLink {
  uri: string;
  relation: StreamLinkRelation;
}

interface EventLink {
  uri: string;
  relation: EventLinkRelation;
}

export interface GYStream {
  title: string;
  id: string;
  updated: string;
  streamId: string;
  author: Author;
  headOfStream: boolean;
  selfUrl: string;
  eTag: string;
  links: StreamLink[];
  entries: GYEvent[];
}

export interface GYEvent {
  eventId: string;
  eventType: string;
  eventNumber: number;
  streamId: string;
  data: string;
  isJson: boolean;
  isMetaData: boolean;
  isLinkMetaData: boolean;
  positionEventNumber: number;
  positionStreamId: string;
  title: string;
  id: string;
  updated: string;
  author: Author;
  summary: string;
  links: EventLink[];
}


/**
 * Implements of EventStoreInterface with Greg Young's Event Store (https://eventstore.org)
 */
export default class GYEventStore implements EventStore {
  private readonly http: AxiosInstance;

  constructor({ url }: ConstructOptions) {
    this.http = axios.create({ baseURL: url });
  }

  getById<E extends Event = Event>(streamId: string): Promise<E[]> {
    const fetchEvents = new BehaviorSubject<string>(`/streams/${streamId}`);
    const fetchNextIfExists = (stream: GYStream) => {
      const nextLink = stream.links.find(link => link.relation === 'next');

      if (nextLink) {
        fetchEvents.next(nextLink.uri);
      } else {
        fetchEvents.complete();
      }
    };

    const getEventsThroughForward = fetchEvents.pipe(
      concatMap(url => from(
        this.http.get<GYStream>(url, {
          params: { embed: 'body' },
          headers: { Accept: 'application/vnd.eventstore.atom+json' },
        }),
      )),
      tap(response => fetchNextIfExists(response.data)),
      map(response => this.parseEventsFromStream<E>(response.data)),
      scan<E[], E[]>((accEvents, events) => accEvents.concat(events.reverse()), []),
      last(),
    );

    return toPromise(getEventsThroughForward);
  }

  async save(streamId: string, events: Event[], options?: SaveOptions): Promise<void> {
    const data: WriteEventsPayload = events.map(event => ({
      eventId: generateUniqueId(),
      eventType: event.type,
      data: event.payload,
    }));

    const headers: any = {
      'Content-Type': 'application/vnd.eventstore.events+json',
    };

    if (options && options.expectedVersion) {
      headers['ES-ExpectedVersion'] = `${options.expectedVersion}`;
    }

    await this.http.post(streamId, data, { headers });
  }

  private parseEventsFromStream<E extends Event = Event>(stream: GYStream): E[] {
    return stream.entries.map((event) => {
      const data = JSON.parse(event.data);

      return {
        type: event.eventType,
        payload: data,
      } as E;
    });
  }
}
