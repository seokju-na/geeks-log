import { FlexLayoutModule } from '@angular/flex-layout';
import { moduleMetadata, storiesOf } from '@storybook/angular';
import { IconModule } from '../icon/icon.module';
import { ButtonModule } from './button.module';

storiesOf('button', module)
  .addDecorator(moduleMetadata({
    imports: [
      FlexLayoutModule,
      ButtonModule,
      IconModule,
    ],
  }))
  .add('overview', () => ({
    template: `
      <div fxLayout fxLayoutGap="10px" style="margin-bottom: 20px">
        <button ui-raised-button>Button</button>
        <button ui-raised-button color="primary">Button</button>
        <button ui-raised-button color="warn">Button</button>
      </div>
      <div fxLayout fxLayoutGap="10px" style="margin-bottom: 20px">
        <button ui-flat-button>Button</button>
        <button ui-flat-button color="primary">Button</button>
        <button ui-flat-button color="warn">Button</button>
      </div>
      <div fxLayout fxLayoutGap="10px">
        <button ui-flat-button size="small">Button</button>
      </div>
    `,
  }))
  .add('with icon', () => ({
    template: `
      <div fxLayout fxLayoutGap="10px">
        <button ui-raised-button color="primary">
          <ui-icon name="favorite"></ui-icon>
          Like
        </button>
        <button ui-flat-button>
          <ui-icon name="favorite"></ui-icon>
          Like
        </button>
      </div>
    `,
  }));
