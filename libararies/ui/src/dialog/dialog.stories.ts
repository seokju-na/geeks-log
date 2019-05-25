import { Component } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { moduleMetadata } from '@storybook/angular';
import { storiesOf } from '@storybook/angular/src/client/preview';
import { Dialog } from './dialog';
import { DialogModule } from './dialog.module';

@Component({
  template: `
    <div>Basic</div>
  `,
})
class BasicDialogComponent {
}

@Component({
  template: `
    <button (click)="openDialog()">Open Dialog</button>
  `,
})
class BasicDialogOpenerComponent {
  constructor(private dialog: Dialog) {
  }

  openDialog() {
    this.dialog.open(BasicDialogComponent);
  }
}

storiesOf('dialog', module)
  .addDecorator(moduleMetadata({
    imports: [
      BrowserAnimationsModule,
      DialogModule,
    ],
    declarations: [
      BasicDialogComponent,
      BasicDialogOpenerComponent,
    ],
  }))
  .add('basic', () => ({
    component: BasicDialogOpenerComponent,
  }));
