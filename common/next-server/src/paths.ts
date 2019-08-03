import isGlob from 'is-glob';
import micromatch from 'micromatch';

export function isPathMatch(pathname: string, matches: string[]) {
  let isMatched = false;

  for (const match of matches) {
    if (isGlob(match)) {
      isMatched = matchSingleGlobPath(pathname, match);
    } else {
      isMatched = matchSingleStringPath(pathname, match);
    }

    if (isMatched) {
      break;
    }
  }

  return isMatched;
}

function matchSingleStringPath(pathname: string, match: string) {
  return pathname.indexOf(match) === 0;
}

function matchSingleGlobPath(pathname: string, matchPattern: string) {
  const matches = micromatch([pathname], matchPattern);
  return matches && matches.length > 0;
}
