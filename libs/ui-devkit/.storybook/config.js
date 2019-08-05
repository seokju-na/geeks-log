const { withKnobs } = require('@storybook/addon-knobs');
const { addDecorator, configure } = require('@storybook/react');

addDecorator(withKnobs);

const req = require.context('../stories/', true, /\.stories\.tsx$/);

function loadStories() {
  req.keys().forEach(req);
}

configure(loadStories, module);
