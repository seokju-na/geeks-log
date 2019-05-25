export default class ApplicationException extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
