import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MenuItemComponent } from './menu-item.component';
import {
  MENU_SCROLL_STRATEGY_FACTORY_PROVIDER,
  MenuTriggerDirective,
} from './menu-trigger.directive';
import { MenuComponent } from './menu.component';

@NgModule({
  imports: [
    A11yModule,
    PortalModule,
    OverlayModule,
    CommonModule,
  ],
  declarations: [
    MenuItemComponent,
    MenuComponent,
    MenuTriggerDirective,
  ],
  providers: [
    MENU_SCROLL_STRATEGY_FACTORY_PROVIDER,
  ],
  exports: [
    MenuItemComponent,
    MenuComponent,
    MenuTriggerDirective,
  ],
})
export class MenuModule {
}
