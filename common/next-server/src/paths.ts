import isGlob from 'is-glob';
import micromatch from 'micromatch';

export function isPathMatch(pathname: string, matches: string[]) {
  return matches.some(match => isGlob(match)
    ? matchSingleGlobPath(pathname, match)
    : matchSingleStringPath(pathname, match))
}

function matchSingleStringPath(pathname: string, match: string) {
  return pathname.indexOf(match) === 0;
}

function matchSingleGlobPath(pathname: string, matchPattern: string) {
  const matches = micromatch([pathname], matchPattern);
  return matches && matches.length > 0;
}
