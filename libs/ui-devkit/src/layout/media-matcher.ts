/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { getPlatform } from '../platform';

/** Global registry for all dynamically-created, injected media queries. */
const mediaQueriesForWebkitCompatibility: Set<string> = new Set<string>();

/** Style tag that holds all of the dynamically-created media queries. */
let mediaQueryStyleNode: HTMLStyleElement | undefined;

export function matchMedia(query: string): MediaQueryList {
  const platform = getPlatform();

  if (platform.WEBKIT) {
    createEmptyStyleRule(query);
  }

  const _matchMedia = platform.isBrowser && window.matchMedia
    ? window.matchMedia.bind(window)
    : noopMatchMedia;

  return _matchMedia(query);
}

/**
 * For Webkit engines that only trigger the MediaQueryListListener when
 * there is at least one CSS selector for the respective media query.
 */
function createEmptyStyleRule(query: string) {
  if (mediaQueriesForWebkitCompatibility.has(query)) {
    return;
  }

  try {
    if (!mediaQueryStyleNode) {
      mediaQueryStyleNode = document.createElement('style');
      mediaQueryStyleNode.setAttribute('type', 'text/css');
      document.head!.appendChild(mediaQueryStyleNode);
    }

    if (mediaQueryStyleNode.sheet) {
      (mediaQueryStyleNode.sheet as CSSStyleSheet)
        .insertRule(`@media ${query} {.fx-query-test{ }}`, 0);
      mediaQueriesForWebkitCompatibility.add(query);
    }
  } catch (e) {
    console.error(e); // eslint-disable-line
  }
}

/** No-op matchMedia replacement for non-browser platforms. */
function noopMatchMedia(query: string): MediaQueryList {
  // Use `as any` here to avoid adding additional necessary properties for
  // the noop matcher.
  return {
    matches: query === 'all' || query === '',
    media: query,
    addListener: () => {},
    removeListener: () => {}
  } as any;
}
