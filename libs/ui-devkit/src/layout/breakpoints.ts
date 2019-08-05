/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { useEffect } from 'react';
import { combineLatest, concat, Observable, Observer, Subject } from 'rxjs';
import { debounceTime, map, skip, startWith, take, takeUntil } from 'rxjs/operators';
import { coerceArray } from '../coercion';
import { matchMedia } from './media-matcher';

export const Breakpoints = {
  XSmall: '(max-width: 599.99px)',
  Small: '(min-width: 600px) and (max-width: 959.99px)',
  Medium: '(min-width: 960px) and (max-width: 1279.99px)',
  Large: '(min-width: 1280px) and (max-width: 1919.99px)',
  XLarge: '(min-width: 1920px)',

  Handset: '(max-width: 599.99px) and (orientation: portrait), ' +
    '(max-width: 959.99px) and (orientation: landscape)',
  Tablet: '(min-width: 600px) and (max-width: 839.99px) and (orientation: portrait), ' +
    '(min-width: 960px) and (max-width: 1279.99px) and (orientation: landscape)',
  Web: '(min-width: 840px) and (orientation: portrait), ' +
    '(min-width: 1280px) and (orientation: landscape)',

  HandsetPortrait: '(max-width: 599.99px) and (orientation: portrait)',
  TabletPortrait: '(min-width: 600px) and (max-width: 839.99px) and (orientation: portrait)',
  WebPortrait: '(min-width: 840px) and (orientation: portrait)',

  HandsetLandscape: '(max-width: 959.99px) and (orientation: landscape)',
  TabletLandscape: '(min-width: 960px) and (max-width: 1279.99px) and (orientation: landscape)',
  WebLandscape: '(min-width: 1280px) and (orientation: landscape)',
};

/** The current state of a layout breakpoint. */
export interface BreakpointState {
  /** Whether the breakpoint is currently matching. */
  matches: boolean;
  /**
   * A key boolean pair for each query provided to the observe method,
   * with its current matched state.
   */
  breakpoints: {
    [key: string]: boolean;
  };
}

/** The current state of a layout breakpoint. */
interface InternalBreakpointState {
  /** Whether the breakpoint is currently matching. */
  matches: boolean;
  /** The media query being to be matched */
  query: string;
}

interface Query {
  observable: Observable<InternalBreakpointState>;
  mql: MediaQueryList;
}

const _queries = new Map<string, Query>();

function _registerQuery(query: string): Query {
  // Only set up a new MediaQueryList if it is not already being listened for.
  if (_queries.has(query)) {
    return _queries.get(query)!;
  }

  const mql: MediaQueryList = matchMedia(query);

  // Create callback for match changes and add it is as a listener.
  const queryObservable = new Observable<MediaQueryList>((observer: Observer<MediaQueryList>) => {
    // Listener callback methods are wrapped to be placed back in ngZone. Callbacks must be placed
    // back into the zone because matchMedia is only included in Zone.js by loading the
    // webapis-media-query.js file alongside the zone.js file.  Additionally, some browsers do not
    // have MediaQueryList inherit from EventTarget, which causes inconsistencies in how Zone.js
    // patches it.
    const handler = (e: any) => observer.next(e);
    mql.addListener(handler);

    return () => {
      mql.removeListener(handler);
    };
  }).pipe(
    startWith(mql),
    map((nextMql: MediaQueryList) => ({ query, matches: nextMql.matches })),
  );

  // Add the MediaQueryList to the set of queries.
  const output = { observable: queryObservable, mql };
  _queries.set(query, output);

  return output;
}

const noop = () => {
};

export function isBreakpointMatched(value: string | string[]) {
  const queries = splitQueries(coerceArray(value));
  return queries.some(mediaQuery => _registerQuery(mediaQuery).mql.matches);
}

export function useBreakpointObserver(
  value: string | string[],
  onBreakpointChange: (state: BreakpointState) => void = noop,
) {
  useEffect(() => {
    const destroySubject = new Subject();

    const queries = splitQueries(coerceArray(value));
    const observables = queries.map(query =>
      _registerQuery(query).observable.pipe(takeUntil(destroySubject)));

    let stateObservable = combineLatest(observables);

    // Emit the first state immediately, and then debounce the subsequent emissions.
    stateObservable = concat(
      stateObservable.pipe(take(1)),
      stateObservable.pipe(skip(1), debounceTime(0)),
    );

    const subscription = stateObservable.pipe(map((breakpointStates: InternalBreakpointState[]) => {
      const response: BreakpointState = {
        matches: false,
        breakpoints: {},
      };

      breakpointStates.forEach((state: InternalBreakpointState) => {
        response.matches = response.matches || state.matches;
        response.breakpoints[state.query] = state.matches;
      });

      return response;
    })).subscribe((state) => {
      onBreakpointChange(state);
    });

    return () => {
      subscription.unsubscribe();
      destroySubject.next();
      destroySubject.complete();
    };
  }, [value, onBreakpointChange]);
}

/**
 * Split each query string into separate query strings if two queries are provided as comma
 * separated.
 */
function splitQueries(queries: string[]): string[] {
  return queries.map((query: string) => query.split(','))
    .reduce((a1: string[], a2: string[]) => a1.concat(a2))
    .map(query => query.trim());
}
