const isEqual = require('lodash.isequal') as (source: any, dist: any) => boolean;

export enum MatchLiterals {
  ANY = '__ANY__',
}

export function matchArguments(args1: any[], args2: any[]): boolean {
  let isAllArgumentsMatches = true;

  for (let index = 0; index < args1.length; index += 1) {
    if (args2[index] === MatchLiterals.ANY) {
      continue;
    }

    if (!isEqual(args1[index], args2[index])) {
      isAllArgumentsMatches = false;
      break;
    }
  }

  return isAllArgumentsMatches;
}
