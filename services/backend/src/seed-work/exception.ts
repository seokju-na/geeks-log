export interface ExceptionLike {
  readonly code: string;
  readonly message?: string;
}

export function isException(error: unknown): error is ExceptionLike {
  return error != null && typeof error === 'object' && 'code' in error;
}

export function matchExceptionCode(error: unknown) {
  return isException(error) ? error.code : null;
}
