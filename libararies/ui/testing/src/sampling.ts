/**
 * Random integer between 'min' to 'max'.
 * The maximum is exclusive and the minimum is inclusive.
 * @returns Randomly chosen number
 */
export function randomInteger(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
}


/**
 * Random index of collection.
 */
export function randomIndex<T = any>(collection: T[]): number {
  return randomInteger(0, collection.length);
}


/**
 * Get a random element from 'collection'.
 * @returns Randomly chosen element
 */
export function sample<T>(collection: T[] | { [key: string]: any }): T {
  let result;

  if (Array.isArray(collection)) {
    result = collection[randomIndex(collection)];
  } else if (typeof collection === 'object') {
    const keys = Object.keys(collection);

    result = collection[keys[randomIndex(keys)]];
  }

  return result;
}


/**
 * Get a random element from 'collection' without 'excluded'.
 *
 * @example
 * enum Example {
 *     A = 10,
 *     B = 20,
 * }
 *
 * sampleWithout<Example>(Example, [Example.B]); // output: Example.A
 *
 * @returns Randomly chosen element
 */
export function sampleWithout<T>(
  collection: T[] | { [key: string]: any },
  excluded: any[],
): T {

  let result;

  do {
    result = sample(collection);
  } while (excluded.includes(result));

  return result;
}
