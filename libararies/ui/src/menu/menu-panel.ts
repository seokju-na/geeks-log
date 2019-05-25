/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { FocusOrigin } from '@angular/cdk/a11y';
import { EventEmitter, InjectionToken, TemplateRef } from '@angular/core';
import { MenuPositionX, MenuPositionY } from './menu-positions';

/**
 * Injection token used to provide the parent menu to menu-specific components.
 */
export const MENU_PANEL = new InjectionToken<MenuPanel>('MENU_PANEL');

/**
 * Interface for a custom menu panel that can be used with `uiMenuTriggerFor`.
 */
export interface MenuPanel<T = any> {
  xPosition: MenuPositionX;
  yPosition: MenuPositionY;
  overlapTrigger: boolean;
  templateRef: TemplateRef<any>;
  close: EventEmitter<void | 'click' | 'keydown' | 'tab'>;
  focusFirstItem: (origin?: FocusOrigin) => void;
  resetActiveItem: () => void;
  setPositionClasses?: (x: MenuPositionX, y: MenuPositionY) => void;

  setElevation?(depth: number): void;

  backdropClass?: string;
  hasBackdrop?: boolean;
  addItem?: (item: T) => void;
  removeItem?: (item: T) => void;
}
