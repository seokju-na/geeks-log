import { DispatchableCreator } from '@geeks-log/event-system';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Event, EventTypeOf } from 'domain/core';

export function ofEventType<Output extends DispatchableCreator>(creator: Output) {
  const isInstanceOf = (event: Event): event is EventTypeOf<Output> => event.type === creator.type;

  return (source: Observable<Event>): Observable<EventTypeOf<Output>> =>
    source.pipe(filter(isInstanceOf));
}
