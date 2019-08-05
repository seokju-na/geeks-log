/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { useEffect, useRef } from 'react';
import { of, Subject } from 'rxjs';
import { getPlatform, normalizePassiveListenerOptions } from '../platform';
import {
  focusedClassName,
  keyboardFocusedClassName,
  mouseFocusedClassName, programFocusedClassName,
  touchFocusedClassName,
} from './class-names';

// This is the value used by AngularJS Material. Through trial and error (on iPhone 6S) they found
// that a value of around 650ms seems appropriate.
export const TOUCH_BUFFER_MS = 650;

export type FocusOrigin = 'touch' | 'mouse' | 'keyboard' | 'program' | null;

/**
 * Corresponds to the options that can be passed to the native `focus` event.
 * via https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
 */
export interface FocusOptions {
  /** Whether the browser should scroll to the element when it is focused. */
  preventScroll?: boolean;
}

interface MonitoredElementInfo {
  unlisten: () => void;
  checkChildren: boolean;
  subject: Subject<FocusOrigin>;
}

/**
 * Event listener options that enable capturing and also
 * mark the listener as passive if the browser supports it.
 */
const captureEventListenerOptions = normalizePassiveListenerOptions({
  passive: true,
  capture: true,
});

const noop = () => {};

interface FocusMonitorOptions {
  onFocusChange?: (origin: FocusOrigin) => void;
  /** @default false */
  checkChildren?: boolean;
}

export function useFocusMonitor<T extends HTMLElement = HTMLElement>({
  onFocusChange = noop,
  checkChildren,
}: FocusMonitorOptions = {}) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (elementRef.current === null) {
      return;
    }

    const element = elementRef.current;
    const subscription = monitor(element, checkChildren)
      .subscribe((origin) => {
        onFocusChange(origin);
      });

    return () => {
      stopMonitoring(element);
      subscription.unsubscribe();
    }
  }, [onFocusChange, checkChildren]);

  return elementRef;
}

export function monitor(
  element: HTMLElement,
  checkChildren: boolean = false,
) {
  if (!getPlatform().isBrowser) {
    return of(null);
  }

  // Check if we're already monitoring this element.
  if (_elementInfo.has(element)) {
    const cachedInfo = _elementInfo.get(element)!;
    cachedInfo.checkChildren = checkChildren;

    return cachedInfo!.subject.asObservable();
  }

  // Create monitored element info.
  const info: MonitoredElementInfo = {
    unlisten: () => {},
    checkChildren: checkChildren,
    subject: new Subject<FocusOrigin>()
  };

  _elementInfo.set(element, info);
  _incrementMonitoredElementCount();

  // Start listening. We need to listen in capture phase since focus events don't bubble.
  const focusListener = (event: FocusEvent) => _onFocus(event, element);
  const blurListener = (event: FocusEvent) => _onBlur(event, element);

  element.addEventListener('focus', focusListener, true);
  element.addEventListener('blur', blurListener, true);

  // Create an unlisten function for later.
  info.unlisten = () => {
    element.removeEventListener('focus', focusListener, true);
    element.removeEventListener('blur', blurListener, true);
  };

  return info.subject.asObservable();
}

export function stopMonitoring(element: HTMLElement) {
  const elementInfo = _elementInfo.get(element);

  if (elementInfo) {
    elementInfo.unlisten();
    elementInfo.subject.complete();

    _setClasses(element);
    _elementInfo.delete(element);
    _decrementMonitoredElementCount();
  }
}

export function focusVia(element: HTMLElement, origin: FocusOrigin, options?: FocusOptions) {
  _setOriginForCurrentEventQueue(origin);

  // `focus` isn't available on the server
  if (typeof element.focus === 'function') {
    // Cast the element to `any`, because the TS typings don't have the `options` parameter yet.
    (element as any).focus(options);
  }
}

/** The focus origin that the next focus event is a result of. */
let _origin: FocusOrigin = null;

/** The FocusOrigin of the last focus event tracked by the FocusMonitor. */
let _lastFocusOrigin: FocusOrigin;

/** Whether the window has just been focused. */
let _windowFocused = false;

/** The target of the last touch event. */
let _lastTouchTarget: EventTarget | null;

/** The timeout id of the touch timeout, used to cancel timeout later. */
let _touchTimeoutId: number;

/** The timeout id of the window focus timeout. */
let _windowFocusTimeoutId: number;

/** The timeout id of the origin clearing timeout. */
let _originTimeoutId: number;

/** Map of elements being monitored to their info. */
const _elementInfo = new Map<HTMLElement, MonitoredElementInfo>();

/** The number of elements currently being monitored. */
let _monitoredElementCount = 0;

/**
 * Event listener for `keydown` events on the document.
 * Needs to be an arrow function in order to preserve the context when it gets bound.
 */
const _documentKeydownListener = () => {
  // On keydown record the origin and clear any touch event that may be in progress.
  _lastTouchTarget = null;
  _setOriginForCurrentEventQueue('keyboard');
};

/**
 * Event listener for `mousedown` events on the document.
 * Needs to be an arrow function in order to preserve the context when it gets bound.
 */
const _documentMousedownListener = () => {
  // On mousedown record the origin only if there is not touch
  // target, since a mousedown can happen as a result of a touch event.
  if (!_lastTouchTarget) {
    _setOriginForCurrentEventQueue('mouse');
  }
};

/**
 * Event listener for `touchstart` events on the document.
 * Needs to be an arrow function in order to preserve the context when it gets bound.
 */
const _documentTouchstartListener = (event: TouchEvent) => {
  // When the touchstart event fires the focus event is not yet in the event queue. This means
  // we can't rely on the trick used above (setting timeout of 1ms). Instead we wait 650ms to
  // see if a focus happens.
  if (_touchTimeoutId != null) {
    window.clearTimeout(_touchTimeoutId);
  }
  _lastTouchTarget = event.target;
  _touchTimeoutId = window.setTimeout(() => _lastTouchTarget = null, TOUCH_BUFFER_MS);
};

/**
 * Event listener for `focus` events on the window.
 * Needs to be an arrow function in order to preserve the context when it gets bound.
 */
const _windowFocusListener = () => {
  // Make a note of when the window regains focus, so we can
  // restore the origin info for the focused element.
  _windowFocused = true;
  _windowFocusTimeoutId = window.setTimeout(() => _windowFocused = false);
};

function _toggleClass(element: Element, className: string, shouldSet: boolean) {
  if (shouldSet) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}

/**
 * Sets the focus classes on the element based on the given focus origin.
 * @param element The element to update the classes on.
 * @param origin The focus origin.
 */
function _setClasses(element: HTMLElement, origin?: FocusOrigin): void {
  const elementInfo = _elementInfo.get(element);

  if (elementInfo) {
    _toggleClass(element, focusedClassName, !!origin);
    _toggleClass(element, touchFocusedClassName, origin === 'touch');
    _toggleClass(element, keyboardFocusedClassName, origin === 'keyboard');
    _toggleClass(element, mouseFocusedClassName, origin === 'mouse');
    _toggleClass(element, programFocusedClassName, origin === 'program');
  }
}

/**
 * Sets the origin and schedules an async function to clear it at the end of the event queue.
 * @param origin The origin to set.
 */
function _setOriginForCurrentEventQueue(origin: FocusOrigin): void {
  _origin = origin;
  // Sometimes the focus origin won't be valid in Firefox because Firefox seems to focus *one*
  // tick after the interaction event fired. To ensure the focus origin is always correct,
  // the focus origin will be determined at the beginning of the next tick.
  _originTimeoutId = window.setTimeout(() => _origin = null, 1);
}

/**
 * Checks whether the given focus event was caused by a touchstart event.
 * @param event The focus event to check.
 * @returns Whether the event was caused by a touch.
 */
function _wasCausedByTouch(event: FocusEvent): boolean {
  // Note(mmalerba): This implementation is not quite perfect, there is a small edge case.
  // Consider the following dom structure:
  //
  // <div #parent tabindex="0" cdkFocusClasses>
  //   <div #child (click)="#parent.focus()"></div>
  // </div>
  //
  // If the user touches the #child element and the #parent is programmatically focused as a
  // result, this code will still consider it to have been caused by the touch event and will
  // apply the cdk-touch-focused class rather than the cdk-program-focused class. This is a
  // relatively small edge-case that can be worked around by using
  // focusVia(parentEl, 'program') to focus the parent element.
  //
  // If we decide that we absolutely must handle this case correctly, we can do so by listening
  // for the first focus event after the touchstart, and then the first blur event after that
  // focus event. When that blur event fires we know that whatever follows is not a result of the
  // touchstart.
  const focusTarget = event.target;

  return _lastTouchTarget instanceof Node && focusTarget instanceof Node &&
    (focusTarget === _lastTouchTarget || focusTarget.contains(_lastTouchTarget));
}

/**
 * Handles focus events on a registered element.
 * @param event The focus event.
 * @param element The monitored element.
 */
function _onFocus(event: FocusEvent, element: HTMLElement) {
  // NOTE(mmalerba): We currently set the classes based on the focus origin of the most recent
  // focus event affecting the monitored element. If we want to use the origin of the first event
  // instead we should check for the cdk-focused class here and return if the element already has
  // it. (This only matters for elements that have includesChildren = true).

  // If we are not counting child-element-focus as focused, make sure that the event target is the
  // monitored element itself.
  const elementInfo = _elementInfo.get(element);
  if (!elementInfo || (!elementInfo.checkChildren && element !== event.target)) {
    return;
  }

  // If we couldn't detect a cause for the focus event, it's due to one of three reasons:
  // 1) The window has just regained focus, in which case we want to restore the focused state of
  //    the element from before the window blurred.
  // 2) It was caused by a touch event, in which case we mark the origin as 'touch'.
  // 3) The element was programmatically focused, in which case we should mark the origin as
  //    'program'.
  let origin = _origin;
  if (!origin) {
    if (_windowFocused && _lastFocusOrigin) {
      origin = _lastFocusOrigin;
    } else if (_wasCausedByTouch(event)) {
      origin = 'touch';
    } else {
      origin = 'program';
    }
  }

  _setClasses(element, origin);
  _emitOrigin(elementInfo.subject, origin);
  _lastFocusOrigin = origin;
}

/**
 * Handles blur events on a registered element.
 * @param event The blur event.
 * @param element The monitored element.
 */
function _onBlur(event: FocusEvent, element: HTMLElement) {
  // If we are counting child-element-focus as focused, make sure that we aren't just blurring in
  // order to focus another child of the monitored element.
  const elementInfo = _elementInfo.get(element);

  if (!elementInfo || (elementInfo.checkChildren && event.relatedTarget instanceof Node &&
    element.contains(event.relatedTarget))) {
    return;
  }

  _setClasses(element);
  _emitOrigin(elementInfo.subject, null);
}

function _emitOrigin(subject: Subject<FocusOrigin>, origin: FocusOrigin) {
  subject.next(origin);
}

function _incrementMonitoredElementCount() {
  // Register global listeners when first element is monitored.
  if (++_monitoredElementCount === 1 && getPlatform().isBrowser) {
    // Note: we listen to events in the capture phase so we
    // can detect them even if the user stops propagation.
    document.addEventListener('keydown', _documentKeydownListener,
      captureEventListenerOptions,
    );
    document.addEventListener('mousedown', _documentMousedownListener,
      captureEventListenerOptions,
    );
    document.addEventListener(
      'touchstart',
      _documentTouchstartListener,
      captureEventListenerOptions,
    );
    window.addEventListener('focus', _windowFocusListener);
  }
}

function _decrementMonitoredElementCount() {
  // Unregister global listeners when last element is unmonitored.
  if (!--_monitoredElementCount) {
    document.removeEventListener('keydown', _documentKeydownListener,
      captureEventListenerOptions,
    );
    document.removeEventListener('mousedown', _documentMousedownListener,
      captureEventListenerOptions,
    );
    document.removeEventListener('touchstart', _documentTouchstartListener,
      captureEventListenerOptions,
    );
    window.removeEventListener('focus', _windowFocusListener);

    // Clear timeouts for all potentially pending timeouts to prevent the leaks.
    window.clearTimeout(_windowFocusTimeoutId);
    window.clearTimeout(_touchTimeoutId);
    window.clearTimeout(_originTimeoutId);
  }
}
