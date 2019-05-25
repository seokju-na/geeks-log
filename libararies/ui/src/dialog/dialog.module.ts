import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { Dialog, DIALOG_SCROLL_STRATEGY_PROVIDER } from './dialog';
import { DialogActionsDirective } from './dialog-actions.directive';
import { DialogContainerComponent } from './dialog-container.component';
import { DialogContentDirective } from './dialog-content.directive';
import { DialogTitleDirective } from './dialog-title.directive';

@NgModule({
  imports: [
    PortalModule,
    OverlayModule,
    A11yModule,
  ],
  declarations: [
    DialogContainerComponent,
    DialogTitleDirective,
    DialogContentDirective,
    DialogActionsDirective,
  ],
  entryComponents: [
    DialogContainerComponent,
  ],
  providers: [
    Dialog,
    DIALOG_SCROLL_STRATEGY_PROVIDER,
  ],
  exports: [
    DialogContainerComponent,
    DialogTitleDirective,
    DialogContentDirective,
    DialogActionsDirective,
  ],
})
export class DialogModule {
}
