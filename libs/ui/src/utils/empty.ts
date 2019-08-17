export function isEmptyValue(value: unknown) {
  return value == null || (typeof value === 'string' && value.trim() === '');
}
