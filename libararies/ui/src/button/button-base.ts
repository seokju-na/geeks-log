import { FocusMonitor } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Color } from '../style';
import { updateDomCssClass, updateDomStyles } from '../utils';

export const BUTTON_HOST_ATTRIBUTES = [
  'ui-raised-button',
  'ui-icon-button',
  'ui-flat-button',
];

export const BUTTON_HOST_ATTRIBUTE_CLASS_NAME_MAP: { [key: string]: string } = {
  'ui-raised-button': 'Button--type-raised',
  'ui-icon-button': 'Button--type-icon',
  'ui-flat-button': 'Button--type-flat',
};

export type ButtonSize = 'small' | 'normal' | 'big';

export abstract class ButtonBase<T extends HTMLElement> implements OnInit, OnDestroy, AfterViewInit {
  protected _color: Color;
  protected _size: ButtonSize;
  protected readonly _isIconButton: boolean;

  @Input()
  get color(): Color {
    return this._color;
  }

  set color(color: Color) {
    updateDomCssClass(
      this.hostElement,
      this._color ? `Button--color-${this._color}` : undefined,
      color ? `Button--color-${color}` : undefined,
    );

    this._color = color;
  }

  @Input()
  get size(): ButtonSize {
    return this._size;
  }

  set size(size: ButtonSize) {
    updateDomCssClass(
      this.hostElement,
      this._color ? `Button--size-${this._size}` : undefined,
      size ? `Button--size-${size}` : undefined,
    );

    this._size = size;
  }

  get hostElement(): T {
    return this.elementRef.nativeElement;
  }

  @HostBinding('class.Button')
  readonly _useInternalClassName = true;

  @HostBinding('class.Button--touching')
  public _touching = false;

  @ViewChild('wrapper') wrapper: ElementRef<HTMLElement>;

  protected constructor(
    protected elementRef: ElementRef<T>,
    private focusMonitor: FocusMonitor,
    private ngZone: NgZone,
  ) {
    // For each of the variant selectors that is prevent in the button's host
    // attributes, add the correct corresponding class.
    for (const attr of BUTTON_HOST_ATTRIBUTES) {
      if (this.hasHostAttributes(attr)) {
        this.hostElement.classList.add(BUTTON_HOST_ATTRIBUTE_CLASS_NAME_MAP[attr]);

        if (attr === 'ui-icon-button') {
          this._isIconButton = true;
        }
      }
    }

    this.focusMonitor.monitor(this.elementRef, true);
  }

  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  ngOnInit(): void {
    if (!this._color) {
      this.color = 'none';
    }

    if (!this._size) {
      this.size = 'normal';
    }
  }

  ngAfterViewInit(): void {
    this._checkForIconInsideOfContent();
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.elementRef);
  }

  @HostListener('touchstart')
  _handleTouchstart() {
    this._touching = true;
  }

  @HostListener('touchend')
  _handleTouchEnd() {
    this._touching = false;
  }

  _checkForIconInsideOfContent(): void {
    if (this._isIconButton) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const iconElementMap = new Map<HTMLElement, 'start' | 'center' | 'end'>();
      const wrapperElement = this.wrapper.nativeElement;

      wrapperElement.childNodes.forEach((node, index) => {
        if (node.nodeType === Node.ELEMENT_NODE
          && (node as HTMLElement).tagName.toLowerCase() === 'ui-icon') {
          iconElementMap.set(
            node as HTMLElement,
            index === 0
              ? 'start'
              : index === wrapperElement.childNodes.length - 1
              ? 'end'
              : 'center',
          );
        }
      });

      iconElementMap.forEach((position, iconElement) => {
        switch (position) {
          case 'start':
            updateDomStyles(iconElement, {
              'margin-left': '-2px',
              'margin-right': '4px',
            });
            break;
          case 'center':
            updateDomStyles(iconElement, {
              'margin-left': '4px',
              'margin-right': '4px',
            });
            break;
          case 'end':
            updateDomStyles(iconElement, {
              'margin-left': '4px',
              'margin-right': '-2px',
            });
            break;
        }
      });

      iconElementMap.clear();
    });
  }

  private hasHostAttributes(...attributes: string[]): boolean {
    return attributes.some(attribute => this.hostElement.hasAttribute(attribute));
  }
}
