import {
  Attribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { Color } from '../style';
import { updateDomCssClass } from '../utils';

@Component({
  selector: 'ui-icon',
  template: '<ng-content></ng-content>',
  styleUrls: ['./icon.component.scss'],
  exportAs: 'uiIcon',
  host: {
    'role': 'img',
    'class': 'Icon',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  private _name: string;
  private _color: Color;

  @Input()
  get name() {
    return this._name;
  }

  set name(name: string) {
    updateDomCssClass(
      this.elementRef.nativeElement,
      this._name ? `GeeksLogIcon__${this._name}` : undefined,
      name ? `GeeksLogIcon__${name}` : undefined,
    );

    this._name = name;
  }

  @Input()
  get color() {
    return this._color;
  }

  set color(color: Color) {
    updateDomCssClass(
      this.elementRef.nativeElement,
      this._color ? `Icon--color-${this._color}` : undefined,
      color ? `Icon--color-${color}` : undefined,
    );

    this._color = color;
  }

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    @Attribute('aria-hidden') ariaHidden: string,
  ) {

    // If the user has not explicitly set aria-hidden, mark the icon as hidden, as this is
    // the right thing to do for the majority of icon use-cases.
    if (!ariaHidden) {
      elementRef.nativeElement.setAttribute('aria-hidden', 'true');
    }
  }
}
