import { FocusMonitor } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  ViewEncapsulation,
} from '@angular/core';
import { ButtonBase } from './button-base';

@Component({
  selector: 'button[ui-raised-button], button[ui-flat-button],' +
    'button[ui-icon-button]',
  exportAs: 'uiButton',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ButtonComponent extends ButtonBase<HTMLButtonElement> {
  constructor(
    elementRef: ElementRef<HTMLButtonElement>,
    focusMonitor: FocusMonitor,
    ngZone: NgZone,
  ) {
    super(elementRef, focusMonitor, ngZone);
  }
}
