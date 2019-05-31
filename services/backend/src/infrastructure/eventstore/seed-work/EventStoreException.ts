export default class EventStoreException extends Error {
  constructor(
    public readonly code: string,
    message: string = code,
  ) {
    super(message);
  }
}
