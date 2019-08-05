import 'intersection-observer';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';

const noop = () => {
};

interface ImpressionOptions {
  rootMargin?: string;
  /** @default 0 */
  areaThreshold?: number;
  /** @default 0 */
  timeThreshold?: number;
  onImpressionStart?: () => void;
  onImpressionExit?: () => void;
}

export function useImpression<T extends HTMLElement = HTMLElement>({
  rootMargin,
  areaThreshold: impressionRatio = 0,
  timeThreshold = 0,
  onImpressionStart = noop,
  onImpressionExit = noop,
}: ImpressionOptions) {
  const elementRef = useRef<T>(null);
  const observer = useRef<IntersectionObserver>();
  const impressions = useRef<Subject<IntersectionObserverEntry[]>>(new Subject());
  const emits = useRef<Subject<{ didImpressionExit: boolean }>>(new Subject());
  const [, setIsImpressed] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (element === null) {
      return;
    }

    observer.current = new IntersectionObserver(
      entries => impressions.current.next(entries),
      { rootMargin, threshold: impressionRatio },
    );
    observer.current.observe(element);

    return () => {
      if (observer.current != null) {
        observer.current.unobserve(element);
      }

      observer.current = undefined;
    };
  }, [rootMargin, impressionRatio]);

  useEffect(() => {
    const subscription = impressions.current.pipe(
      filter(entries => entries.length > 0),
      map(([entry]) => {
        const currentRatio = entry.intersectionRatio;
        return impressionRatio === 0 ? !entry.isIntersecting : currentRatio < impressionRatio;
      }),
    ).subscribe(didImpressionEnd => {
      setIsImpressed(isImpressed => {
        if (didImpressionEnd && isImpressed) {
          emits.current.next({ didImpressionExit: true });
          return false;
        } else if (!didImpressionEnd && !isImpressed) {
          emits.current.next({ didImpressionExit: false });
          return true;
        }
        return isImpressed;
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [timeThreshold, impressionRatio]);

  useEffect(() => {
    const subscription = emits.current.pipe(
      debounceTime(timeThreshold),
    ).subscribe(({ didImpressionExit }) => {
      if (didImpressionExit) {
        onImpressionExit();
      } else {
        onImpressionStart();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onImpressionExit, onImpressionStart, timeThreshold]);

  return elementRef;
}

interface Props extends ImpressionOptions {
  className?: string;
  children?: ReactNode;
}

export function Impression({
  className,
  children,
  ...impressionOptions
}: Props) {
  const ref = useImpression<HTMLDivElement>(impressionOptions);

  return <div ref={ref} className={className}>{children}</div>;
}
