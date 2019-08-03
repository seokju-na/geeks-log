import { DomainEvent } from './domain-event';

export type Command<P> = (params: P) => DomainEvent[];

export type CommandParams<C> = C extends Command<infer P> ? P : never;
