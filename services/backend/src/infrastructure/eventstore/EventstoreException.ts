export default class EventstoreException extends Error {
  public readonly code: string;

  constructor(
    code: string,
    message: string = code,
  ) {
    super(message);
    this.code = `infrastructure.${code}`;
  }
}
