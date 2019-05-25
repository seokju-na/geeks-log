export default function coercionString(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }

  if (Number.isNaN(value as number) || value === Infinity || value === -Infinity) {
    return '';
  }

  return `${value}`;
}
