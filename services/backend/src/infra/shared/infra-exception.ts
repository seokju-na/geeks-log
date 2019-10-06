export const INFRA_EXCEPTION_NAME = 'InfraException';

export class InfraException extends Error {
  public readonly name = INFRA_EXCEPTION_NAME;

  constructor(public readonly code: string, errorMessage: string = code) {
    super(errorMessage);
  }
}

export function isInfraException(error: unknown): error is InfraException {
  if (error != null && typeof error === 'object' && 'name' in error) {
    return (error as any).name === INFRA_EXCEPTION_NAME;
  }
  return false;
}
