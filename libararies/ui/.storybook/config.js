import { configure } from '@storybook/angular';
import '!style-loader!css-loader!sass-loader!./ui.scss';

function loadStories() {
  const req = require.context('../src', true, /\.stories\.ts/);
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
