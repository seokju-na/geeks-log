import { Provider } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import Event from '../../domain/seed-work/Event';
import Eventstore, { GetOptions, SaveOptions } from '../../infrastructure/eventstore/Eventstore';
import { EVENTSTORE } from '../../infrastructure/eventstore/injections';

export default class MockEventstore implements Eventstore {
  static provide(): Provider {
    return {
      provide: EVENTSTORE,
      useFactory() {
        return new MockEventstore();
      },
    };
  }

  private readonly mockGetById: jest.Mock<ReturnType<Eventstore['getById']>> = jest.fn();
  private readonly mockSave: jest.Mock<ReturnType<Eventstore['save']>> = jest.fn();
  private readonly streamSubjectMap: Map<string, Subject<Event>> = new Map();

  clear() {
    for (const subject of this.streamSubjectMap.values()) {
      subject.complete();
    }

    this.mockGetById.mockClear();
    this.mockSave.mockClear();
    this.streamSubjectMap.clear();
  }

  shouldReturnsEventsWhenGetByIdCalled(streamId: string, events: Event[]) {
    this.mockGetById.mockImplementationOnce((actualStreamId: string) => {
      if (actualStreamId !== streamId) {
        throw new Error(`streamId does not match: expect=${streamId}, actual=${actualStreamId}`);
      }

      return Promise.resolve(events);
    });
  }

  pushStream(streamId: string, event: Event) {
    if (!this.streamSubjectMap.has(streamId)) {
      throw new Error(`no stream subject: ${streamId}`);
    }

    this.streamSubjectMap.get(streamId).next(event);
  }

  getById(streamId: string, options?: GetOptions): Promise<Event[]> {
    return this.mockGetById(streamId, options);
  }

  save(streamId: string, events: Event[], options?: SaveOptions): Promise<void> {
    return this.mockSave(streamId, events, options);
  }

  stream(streamId: string): Observable<Event> {
    if (this.streamSubjectMap.has(streamId)) {
      return this.streamSubjectMap.get(streamId).asObservable();
    }

    const subject = new Subject<Event>();
    this.streamSubjectMap.set(streamId, subject);

    return subject.asObservable();
  }
}
