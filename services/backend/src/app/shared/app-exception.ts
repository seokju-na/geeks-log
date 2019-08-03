export const APP_EXCEPTION_NAME = 'AppException';

export class AppException extends Error {
  public readonly name = APP_EXCEPTION_NAME;

  constructor(
    public readonly code: string,
    errorMessage: string = code,
  ) {
    super(errorMessage);
  }
}

export function isAppException(error: unknown): error is AppException {
  if (error != null && typeof error === 'object' && 'name' in error) {
    return (error as any).name === APP_EXCEPTION_NAME;
  }
  return false;
}
