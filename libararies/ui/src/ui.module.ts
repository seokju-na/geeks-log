import { NgModule } from '@angular/core';
import { ButtonModule } from './button/button.module';
import { DialogModule } from './dialog/dialog.module';
import { IconModule } from './icon/icon.module';
import { MenuModule } from './menu/menu.module';

const UI_MODULES = [
  ButtonModule,
  IconModule,
  MenuModule,
  DialogModule,
];

@NgModule({
  imports: UI_MODULES,
  exports: UI_MODULES,
})
export class UiModule {
}
