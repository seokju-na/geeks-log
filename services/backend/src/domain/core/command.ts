import { DomainEvent } from './domain-event';

export abstract class Command<Payload = any> {
  public payload?: Payload;
}

export type CommandExecutor = (command: Command) => DomainEvent[];

export type ReturnEventsOf<CE> = CE extends (command: Command) => infer Events ? Events : never;

/**
 * Check if instance is command type.
 */
export function isCommand(command: unknown): command is Command {
  if (typeof command !== 'object' || command == null) {
    return false;
  }

  return Object.getPrototypeOf(command.constructor.prototype) === Command.prototype;
}
