import { useCallback, useEffect, useRef } from 'react';
import { liveAnnouncerClassName, visuallyHiddenClassName } from './class-names';

/** Possible politeness levels. */
export type AriaLivePoliteness = 'off' | 'polite' | 'assertive';

let liveElement: HTMLElement | null = null;

function getLiveElement() {
  if (liveElement !== null) {
    return liveElement;
  }

  liveElement = document.createElement('div');

  liveElement.classList.add(liveAnnouncerClassName);
  liveElement.classList.add(visuallyHiddenClassName);

  liveElement.setAttribute('aria-atomic', 'true');

  document.body.appendChild(liveElement);

  return liveElement;
}

function removeLiveElement() {
  if (liveElement && liveElement.parentNode) {
    liveElement.parentNode.removeChild(liveElement);
    liveElement = null;
  }
}

interface AnnounceOptions {
  message: string;
  politeness?: AriaLivePoliteness;
  duration?: number;
}

/***
 * @example
 * const { announce, clear } = useLiveAnnouncer();
 *
 * announce('Hello world!');
 * clear();
 */
export function useLiveAnnouncer() {
  const previousTimeout = useRef<number>();

  const clear = useCallback(() => {
    getLiveElement().textContent = '';
  }, []);

  const announce = useCallback(({
    message,
    politeness = 'polite',
    duration,
  }: AnnounceOptions) => {
    clear();
    window.clearTimeout(previousTimeout.current);

    const liveEl = getLiveElement();
    liveEl.setAttribute('aria-live', politeness);

    return new Promise((resolve) => {
      window.clearTimeout(previousTimeout.current);

      // This 100ms timeout is necessary for some browser + screen-reader combinations:
      // - Both JAWS and NVDA over IE11 will not announce anything without a non-zero timeout.
      // - With Chrome and IE11 with NVDA or JAWS, a repeated (identical) message won't be read a
      //   second time without clearing and then using a non-zero delay.
      // (using JAWS 17 at time of this writing).
      previousTimeout.current = window.setTimeout(() => {
        liveEl.textContent = message;
        resolve();

        if (typeof duration === 'number') {
          previousTimeout.current = window.setTimeout(() => clear(), duration);
        }
      }, 100);
    });
  }, [clear]);

  useEffect(() => () => {
    window.clearTimeout(previousTimeout.current);
    removeLiveElement();
  }, []);

  return { announce, clear };
}
