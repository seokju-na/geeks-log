/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  animate,
  AnimationTriggerMetadata,
  group,
  query,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

/**
 * Animations used by the mat-menu component.
 * Animation duration and timing values are based on:
 * https://material.io/guidelines/components/menus.html#menus-usage
 * @docs-private
 */
export const menuAnimations: {
  readonly transformMenu: AnimationTriggerMetadata;
  readonly fadeInItems: AnimationTriggerMetadata;
} = {
  /**
   * This animation controls the menu panel's entry and exit from the page.
   *
   * When the menu panel is added to the DOM, it scales in and fades in its border.
   *
   * When the menu panel is removed from the DOM, it simply fades out after a brief
   * delay to display the ripple.
   */
  transformMenu: trigger('transformMenu', [
    state('void', style({
      opacity: 0,
      transform: 'scale(0.8)',
    })),
    transition('void => enter', group([
      query('.Menu__content', animate('100ms linear', style({ opacity: 1 }))),
      animate('120ms cubic-bezier(0, 0, 0.2, 1)', style({ transform: 'scale(1)' })),
    ])),
    transition('* => void', animate('100ms 25ms linear', style({ opacity: 0 }))),
  ]),


  /**
   * This animation fades in the background color and content of the menu panel
   * after its containing element is scaled in.
   */
  fadeInItems: trigger('fadeInItems', [
    // TODO: this is inside the `transformMenu` now.
    //  Remove next time we do breaking changes.
    state('showing', style({ opacity: 1 })),
    transition('void => *', [
      style({ opacity: 0 }),
      animate('400ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)'),
    ]),
  ]),
};
