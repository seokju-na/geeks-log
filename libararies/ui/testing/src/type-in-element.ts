/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { dispatchFakeEvent } from './dispatch-event';

export function typeInElement(
  value: string,
  element: HTMLInputElement | HTMLTextAreaElement,
): void {
  element.focus();
  element.value = value;
  dispatchFakeEvent(element, 'input');
}
