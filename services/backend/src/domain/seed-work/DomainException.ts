export default class DomainException extends Error {
  constructor(
    public readonly code: string,
    message?: string,
  ) {
    super(message);
  }
}
