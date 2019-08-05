/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { useEffect, useRef } from 'react';
import { EMPTY, Subject } from 'rxjs';
import { getPlatform, normalizePassiveListenerOptions } from '../platform';
import { textFieldAutofilledClassName } from './class-names';

/** An event that is emitted when the autofill state of an input changes. */
export interface AutofillEvent {
  /** The element whose autofill state changes. */
  target: Element;
  /** Whether the element is currently autofilled. */
  isAutofilled: boolean;
}

/** Used to track info about currently monitored elements. */
interface MonitoredElementInfo {
  subject: Subject<AutofillEvent>;
  unlisten: () => void;
}

/** Options to pass to the animationstart listener. */
const listenerOptions = normalizePassiveListenerOptions({ passive: true });

const _monitoredElements = new Map<Element, MonitoredElementInfo>();

const noop = () => {};

interface AutofillOptions {
  onAutofill?: (event: AutofillEvent) => void;
}

export function useAutofill<T extends HTMLElement = HTMLElement>({
  onAutofill = noop,
}: AutofillOptions) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (elementRef.current === null) {
      return;
    }

    const element = elementRef.current;
    const subscription = monitor(element).subscribe(event => onAutofill(event));

    return () => {
      subscription.unsubscribe();
      stopMonitoring(element);
    }
  }, [onAutofill]);

  return elementRef;
}

function monitor(element: HTMLElement) {
  if (!getPlatform().isBrowser) {
    return EMPTY;
  }

  const info = _monitoredElements.get(element);

  if (info) {
    return info.subject.asObservable();
  }

  const result = new Subject<AutofillEvent>();
  const listener = ((event: AnimationEvent) => {
    // Animation events fire on initial element render, we check for the presence of the autofill
    // CSS class to make sure this is a real change in state, not just the initial render before
    // we fire off events.
    if (event.animationName === 'cdk-text-field-autofill-start' &&
      !element.classList.contains(textFieldAutofilledClassName)) {
      element.classList.add(textFieldAutofilledClassName);
      result.next({ target: event.target as Element, isAutofilled: true });
    } else if (event.animationName === 'cdk-text-field-autofill-end' &&
      element.classList.contains(textFieldAutofilledClassName)) {
      element.classList.remove(textFieldAutofilledClassName);
      result.next({ target: event.target as Element, isAutofilled: false });
    }
  }) as EventListenerOrEventListenerObject;

  element.addEventListener('animationstart', listener, listenerOptions);
  element.classList.add('cdk-text-field-autofill-monitored');

  _monitoredElements.set(element, {
    subject: result,
    unlisten: () => {
      element.removeEventListener('animationstart', listener, listenerOptions);
    },
  });

  return result.asObservable();
}

function stopMonitoring(element: Element): void {
  const info = _monitoredElements.get(element);

  if (info) {
    info.unlisten();
    info.subject.complete();
    element.classList.remove('cdk-text-field-autofill-monitored');
    element.classList.remove(textFieldAutofilledClassName);
    _monitoredElements.delete(element);
  }
}
