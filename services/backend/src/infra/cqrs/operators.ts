import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DomainEvent } from '../../domain/core';

export function ofEventType<Input extends DomainEvent, Output extends DomainEvent>(
  ...types: DomainEvent['type'][]
) {
  const isInstanceOf = (event: DomainEvent): event is Output =>
    types.some(eventType => event.type === eventType);

  return (source: Observable<Input>): Observable<Output> => source.pipe(filter(isInstanceOf));
}
