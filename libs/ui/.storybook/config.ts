import { withKnobs } from '@storybook/addon-knobs';
import { addDecorator, configure } from '@storybook/react';
import '../src/styles.scss';
import { withThemeProvider } from './theme-addon';

const req = require.context('../stories/', true, /\.stories\.tsx$/);

function loadStories() {
  req.keys().forEach(req);
}

addDecorator(withThemeProvider);
addDecorator(withKnobs);

configure(loadStories, module);
