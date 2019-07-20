export default function NoDuplicateArray<T>(arr: T[]) {
  return [...new Set(arr)];
}
