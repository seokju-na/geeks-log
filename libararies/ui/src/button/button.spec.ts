import { A11yModule, FocusMonitor } from '@angular/cdk/a11y';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { expectDom, fastTestSetup } from '../../testing';
import { IconModule } from '../icon/icon.module';
import { ButtonModule } from './button.module';

@Component({
  template: `
    <button id="raised-button" ui-raised-button>
      Raised Button
    </button>
    <button id="raised-primary-button" ui-raised-button color="primary">
      Raised Primary Button
    </button>
    <button id="raised-warn-button" ui-raised-button color="warn">
      Raised Warn Button
    </button>
    <button id="left-icon-button" ui-flat-button>
      <ui-icon name="menu"></ui-icon>
      Button
    </button>
    <button id="right-icon-button" ui-flat-button>
      Button
      <ui-icon name="menu"></ui-icon>
    </button>
    <button id="center-icon-button" ui-flat-button>
      Button
      <ui-icon name="menu"></ui-icon>
      Button
    </button>
  `,
})
class ButtonTestComponent {
}

describe('button', () => {
  let fixture: ComponentFixture<ButtonTestComponent>;
  let focusMonitor: FocusMonitor;

  const getButtonById = (id: string): HTMLButtonElement => fixture.debugElement.query(
    By.css(`#${id}`),
  ).nativeElement;

  fastTestSetup();

  beforeAll(async () => {
    await TestBed
      .configureTestingModule({
        imports: [
          A11yModule,
          IconModule,
          ButtonModule,
        ],
        declarations: [
          ButtonTestComponent,
        ],
      })
      .compileComponents();
  });

  beforeEach(() => {
    focusMonitor = TestBed.get(FocusMonitor);

    fixture = TestBed.createComponent(ButtonTestComponent);
    fixture.detectChanges();
  });

  describe('appearance', () => {
    it('should button rendered correctly.', () => {
      expectDom(getButtonById('raised-button')).toContainClasses('Button--type-raised');
      expectDom(getButtonById('raised-primary-button')).toContainClasses('Button--color-primary');
      expectDom(getButtonById('raised-warn-button')).toContainClasses('Button--color-warn');
    });
  });

  describe('icon contains', () => {
    it('should set margin style if button contains icon.', () => {
      let icon: HTMLElement;
      const getIcon = (button: HTMLElement) => button.querySelector('ui-icon') as HTMLElement;

      // Left icon button.
      icon = getIcon(getButtonById('left-icon-button'));
      expectDom(icon).toBeStyled('marginLeft', '-2px');
      expectDom(icon).toBeStyled('marginRight', '4px');

      // Center icon button.
      icon = getIcon(getButtonById('center-icon-button'));
      expectDom(icon).toBeStyled('marginLeft', '4px');
      expectDom(icon).toBeStyled('marginRight', '4px');

      // Right icon button.
      icon = getIcon(getButtonById('right-icon-button'));
      expectDom(icon).toBeStyled('marginLeft', '4px');
      expectDom(icon).toBeStyled('marginRight', '-2px');
    });
  });
});
