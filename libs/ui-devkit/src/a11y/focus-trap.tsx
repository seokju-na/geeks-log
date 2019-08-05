/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import React, { ReactNode, useEffect, useRef } from 'react';
import { focusTrapAnchorClassName, visuallyHiddenClassName } from './class-names';
import { getInteractivityChecker, InteractivityChecker } from './interactive-checker';

export type AutoFocusTarget = 'initial' | 'firstTabbable' | 'lastTabbable';

interface FocusTrapOptions {
  /** @default initial */
  autoFocusTarget?: AutoFocusTarget;
  /** @default true */
  enable?: boolean;
}

export function useFocusTrap<T extends HTMLElement = HTMLElement>({
  autoFocusTarget = 'initial',
  enable = true,
}: FocusTrapOptions = {}) {
  const elementRef = useRef<T>(null);
  const focusTrap = useRef<FocusTrapper>();

  useEffect(() => {
    if (elementRef.current === null) {
      return;
    }

    const element = elementRef.current;
    const previouslyFocusedElement = document.activeElement as HTMLElement;
    let _focusTrap = focusTrap.current;

    if (enable && focusTrap.current === undefined) {
      _focusTrap = new FocusTrapper(element);
      focusTrap.current = _focusTrap;

      switch (autoFocusTarget) {
        case 'initial':
          _focusTrap.focusInitialElementWhenReady();
          break;
        case 'firstTabbable':
          _focusTrap.focusFirstTabbableElementWhenReady();
          break;
        case 'lastTabbable':
          _focusTrap.focusLastTabbableElementWhenReady();
          break;
      }
    }

    return () => {
      if (_focusTrap !== undefined) {
        _focusTrap.destroy();
        focusTrap.current = undefined;
      }

      if (previouslyFocusedElement !== undefined && typeof previouslyFocusedElement.focus === 'function') {
        previouslyFocusedElement.focus();
      }
    };
  }, [autoFocusTarget, enable]);

  useEffect(() => {
    if (focusTrap.current === undefined) {
      return;
    }

    focusTrap.current.enabled = enable;
  }, [enable]);

  return elementRef;
}

interface Props extends FocusTrapOptions {
  children: ReactNode;
  className?: string;
}

export function FocusTrap({ autoFocusTarget, enable, children, className }: Props) {
  const ref = useFocusTrap<HTMLDivElement>({ autoFocusTarget, enable });

  return <div ref={ref} className={className}>{children}</div>;
}

/**
 * Class that allows for trapping focus within a DOM element.
 *
 * This class currently uses a relatively simple approach to focus trapping.
 * It assumes that the tab order is the same as DOM order, which is not necessarily true.
 * Things like `tabIndex > 0`, flex `order`, and shadow roots can cause to two to misalign.
 */
class FocusTrapper {
  private _startAnchor: HTMLElement | null = null;
  private _endAnchor: HTMLElement | null = null;
  private _hasAttached = false;
  private _checker: InteractivityChecker;

  // Event listeners for the anchors. Need to be regular functions so that we can unbind them later.
  protected startAnchorListener = () => this.focusLastTabbableElement();
  protected endAnchorListener = () => this.focusFirstTabbableElement();

  /** Whether the focus trap is active. */
  get enabled(): boolean { return this._enabled; }
  set enabled(value: boolean) {
    this._enabled = value;

    if (this._startAnchor && this._endAnchor) {
      this._toggleAnchorTabIndex(value, this._startAnchor);
      this._toggleAnchorTabIndex(value, this._endAnchor);
    }
  }
  private _enabled: boolean = true;

  constructor(
    private _element: HTMLElement,
    deferAnchors = false,
  ) {
    this._checker = getInteractivityChecker();

    if (!deferAnchors) {
      this.attachAnchors();
    }
  }

  /** Destroys the focus trap by cleaning up the anchors. */
  destroy() {
    const startAnchor = this._startAnchor;
    const endAnchor = this._endAnchor;

    if (startAnchor) {
      startAnchor.removeEventListener('focus', this.startAnchorListener);

      if (startAnchor.parentNode) {
        startAnchor.parentNode.removeChild(startAnchor);
      }
    }

    if (endAnchor) {
      endAnchor.removeEventListener('focus', this.endAnchorListener);

      if (endAnchor.parentNode) {
        endAnchor.parentNode.removeChild(endAnchor);
      }
    }

    this._startAnchor = this._endAnchor = null;
  }

  /**
   * Inserts the anchors into the DOM. This is usually done automatically
   * in the constructor, but can be deferred for cases like directives with `*ngIf`.
   * @returns Whether the focus trap managed to attach successfuly. This may not be the case
   * if the target element isn't currently in the DOM.
   */
  attachAnchors(): boolean {
    // If we're not on the browser, there can be no focus to trap.
    if (this._hasAttached) {
      return true;
    }

    if (!this._startAnchor) {
      this._startAnchor = this._createAnchor();
      this._startAnchor!.addEventListener('focus', this.startAnchorListener);
    }

    if (!this._endAnchor) {
      this._endAnchor = this._createAnchor();
      this._endAnchor!.addEventListener('focus', this.endAnchorListener);
    }

    if (this._element.parentNode) {
      this._element.parentNode.insertBefore(this._startAnchor!, this._element);
      this._element.parentNode.insertBefore(this._endAnchor!, this._element.nextSibling);
      this._hasAttached = true;
    }

    return this._hasAttached;
  }

  /**
   * Waits for the zone to stabilize, then either focuses the first element that the
   * user specified, or the first tabbable element.
   * @returns Returns a promise that resolves with a boolean, depending
   * on whether focus was moved successfuly.
   */
  focusInitialElementWhenReady(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(this.focusInitialElement());
    });
  }

  /**
   * Waits for the zone to stabilize, then focuses
   * the first tabbable element within the focus trap region.
   * @returns Returns a promise that resolves with a boolean, depending
   * on whether focus was moved successfuly.
   */
  focusFirstTabbableElementWhenReady(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(this.focusFirstTabbableElement());
    });
  }

  /**
   * Waits for the zone to stabilize, then focuses
   * the last tabbable element within the focus trap region.
   * @returns Returns a promise that resolves with a boolean, depending
   * on whether focus was moved successfuly.
   */
  focusLastTabbableElementWhenReady(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(this.focusLastTabbableElement());
    });
  }

  /**
   * Get the specified boundary element of the trapped region.
   * @param bound The boundary to get (start or end of trapped region).
   * @returns The boundary element.
   */
  private _getRegionBoundary(bound: 'start' | 'end'): HTMLElement | null {
    // Contains the deprecated version of selector, for temporary backwards comparability.
    const markers = this._element.querySelectorAll(`[cdkFocusRegion${bound}]`) as NodeListOf<HTMLElement>;

    if (bound === 'start') {
      return markers.length ? markers[0] : this._getFirstTabbableElement(this._element);
    }
    return markers.length
      ? markers[markers.length - 1]
      : this._getLastTabbableElement(this._element);
  }

  /**
   * Focuses the element that should be focused when the focus trap is initialized.
   * @returns Whether focus was moved successfuly.
   */
  focusInitialElement(): boolean {
    // Contains the deprecated version of selector, for temporary backwards comparability.
    const redirectToElement = this._element.querySelector('[cdkFocusInitial]') as HTMLElement;

    if (redirectToElement && typeof redirectToElement.focus === 'function') {
      redirectToElement.focus();
      return true;
    }

    return this.focusFirstTabbableElement();
  }

  /**
   * Focuses the first tabbable element within the focus trap region.
   * @returns Whether focus was moved successfuly.
   */
  focusFirstTabbableElement(): boolean {
    const redirectToElement = this._getRegionBoundary('start');

    if (redirectToElement) {
      redirectToElement.focus();
    }

    return !!redirectToElement;
  }

  /**
   * Focuses the last tabbable element within the focus trap region.
   * @returns Whether focus was moved successfuly.
   */
  focusLastTabbableElement(): boolean {
    const redirectToElement = this._getRegionBoundary('end');

    if (redirectToElement) {
      redirectToElement.focus();
    }

    return !!redirectToElement;
  }

  /**
   * Checks whether the focus trap has successfuly been attached.
   */
  hasAttached(): boolean {
    return this._hasAttached;
  }

  /** Get the first tabbable element from a DOM subtree (inclusive). */
  private _getFirstTabbableElement(root: HTMLElement): HTMLElement | null {
    if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) {
      return root;
    }

    // Iterate in DOM order. Note that IE doesn't have `children` for SVG so we fall
    // back to `childNodes` which includes text nodes, comments etc.
    const children = root.children || root.childNodes;

    for (let i = 0; i < children.length; i++) {
      const tabbableChild = children[i].nodeType === document.ELEMENT_NODE
        ? this._getFirstTabbableElement(children[i] as HTMLElement)
        : null;

      if (tabbableChild) {
        return tabbableChild;
      }
    }

    return null;
  }

  /** Get the last tabbable element from a DOM subtree (inclusive). */
  private _getLastTabbableElement(root: HTMLElement): HTMLElement | null {
    if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) {
      return root;
    }

    // Iterate in reverse DOM order.
    const children = root.children || root.childNodes;

    for (let i = children.length - 1; i >= 0; i--) {
      const tabbableChild = children[i].nodeType === document.ELEMENT_NODE
        ? this._getLastTabbableElement(children[i] as HTMLElement)
        : null;

      if (tabbableChild) {
        return tabbableChild;
      }
    }

    return null;
  }

  /** Creates an anchor element. */
  private _createAnchor(): HTMLElement {
    const anchor = document.createElement('div');
    this._toggleAnchorTabIndex(this._enabled, anchor);
    anchor.classList.add(visuallyHiddenClassName);
    anchor.classList.add(focusTrapAnchorClassName);
    anchor.setAttribute('aria-hidden', 'true');
    return anchor;
  }

  /**
   * Toggles the `tabindex` of an anchor, based on the enabled state of the focus trap.
   * @param isEnabled Whether the focus trap is enabled.
   * @param anchor Anchor on which to toggle the tabindex.
   */
  private _toggleAnchorTabIndex(isEnabled: boolean, anchor: HTMLElement) {
    // Remove the tabindex completely, rather than setting it to -1, because if the
    // element has a tabindex, the user might still hit it when navigating with the arrow keys.
    isEnabled ? anchor.setAttribute('tabindex', '0') : anchor.removeAttribute('tabindex');
  }
}
