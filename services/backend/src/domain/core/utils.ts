import { $$TYPE, Dispatchable } from '@geeks-log/event-system';
import * as generateUUId from 'uuid/v4';

export function matchType<T extends Dispatchable>(value: unknown, type: string): value is T {
  return typeof value === 'object' && value != null && value[$$TYPE] === type;
}

export function createId() {
  return generateUUId();
}

export function createTimestamp() {
  return new Date().toISOString();
}
