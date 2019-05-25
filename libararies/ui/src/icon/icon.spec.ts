import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { expectDom, fastTestSetup } from '../../testing';
import { Color } from '../style';
import { IconModule } from './icon.module';

@Component({
  template: `
    <ui-icon [name]="iconName" [color]="iconColor"></ui-icon>
  `,
})
class IconTestComponent {
  iconName = '';
  iconColor: Color;
}

describe('icon', () => {
  fastTestSetup();

  let fixture: ComponentFixture<IconTestComponent>;
  let component: IconTestComponent;

  const getIcon = () => fixture.debugElement.query(
    By.css('ui-icon'),
  ).nativeElement as HTMLElement;

  beforeAll(async () => {
    await TestBed
      .configureTestingModule({
        imports: [
          IconModule,
        ],
        declarations: [
          IconTestComponent,
        ],
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconTestComponent);
    component = fixture.componentInstance;
  });

  it('can update icon name with css class.', () => {
    component.iconName = 'menu';
    fixture.detectChanges();
    expectDom(getIcon()).toContainClasses('Icon__menu');

    component.iconName = 'dashboard';
    fixture.detectChanges();
    expectDom(getIcon()).toContainClasses('Icon__dashboard');
  });

  it('can update icon color with css class.', () => {
    component.iconColor = 'primary';
    fixture.detectChanges();
    expectDom(getIcon()).toContainClasses('Icon--color-primary');

    component.iconColor = 'warn';
    fixture.detectChanges();
    expectDom(getIcon()).toContainClasses('Icon--color-warn');
  });
});
