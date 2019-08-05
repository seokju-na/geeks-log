/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface Platform {
  readonly isBrowser: boolean;
  readonly EDGE: boolean;
  readonly TRIDENT: boolean;
  readonly BLINK: boolean;
  readonly WEBKIT: boolean;
  readonly IOS: boolean;
  readonly FIREFOX: boolean;
  readonly ANDROID: boolean;
  readonly SAFARI: boolean;
}

export function getPlatform(): Platform {
  // Whether the current platform supports the V8 Break Iterator. The V8 check
  // is necessary to detect all Blink based browsers.
  let hasV8BreakIterator: boolean;

  // We need a try/catch around the reference to `Intl`, because accessing it in some cases can
  // cause IE to throw. These cases are tied to particular versions of Windows and can happen if
  // the consumer is providing a polyfilled `Map`. See:
  // https://github.com/Microsoft/ChakraCore/issues/3189
  // https://github.com/angular/components/issues/15687
  try {
    hasV8BreakIterator = (typeof Intl !== 'undefined' && (Intl as any).v8BreakIterator);
  } catch {
    hasV8BreakIterator = false;
  }

  const isBrowser = typeof document === 'object' && !!document;

  const EDGE = isBrowser && /(edge)/i.test(navigator.userAgent);
  const TRIDENT = isBrowser && /(msie|trident)/i.test(navigator.userAgent);
  const BLINK = isBrowser && (((window as any).chrome || hasV8BreakIterator)
    && typeof CSS !== 'undefined'
    && !EDGE
    && !TRIDENT);
  const WEBKIT = isBrowser
    && /AppleWebKit/i.test(navigator.userAgent)
    && !BLINK
    && !EDGE
    && !TRIDENT;
  const IOS = isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
  const FIREFOX = isBrowser && /(firefox|minefield)/i.test(navigator.userAgent);
  const ANDROID = isBrowser && /android/i.test(navigator.userAgent) && !TRIDENT;
  const SAFARI = isBrowser && /safari/i.test(navigator.userAgent) && WEBKIT;

  return {
    isBrowser,
    EDGE,
    TRIDENT,
    BLINK,
    WEBKIT,
    IOS,
    FIREFOX,
    ANDROID,
    SAFARI,
  };
}
