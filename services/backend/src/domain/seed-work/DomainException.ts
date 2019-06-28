export default class DomainException extends Error {
  public readonly code;

  constructor(
    code: string,
    message?: string,
  ) {
    super(message);
    this.code = `domain.${code}`;
  }
}
