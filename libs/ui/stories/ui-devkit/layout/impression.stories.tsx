import { Impression } from '@geeks-log/ui-devkit';
import { action } from '@storybook/addon-actions';
import { number, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';

storiesOf('ui-devkit/layout/impression', module)
  .add('Using <Impression />', () => {
    const rootMargin = text('rootMargin', '0px');
    const timeThreshold = number('timeThreshold', 0);
    const areaThreshold = number('areaThreshold', 0);

    return (
      <div style={{ padding: '32px', height: '2000px' }}>
        <Impression
          rootMargin={rootMargin}
          timeThreshold={timeThreshold}
          areaThreshold={areaThreshold}
          onImpressionStart={action('impression start')}
          onImpressionExit={action('impression exit')}
        >
          <div style={{ width: '700px', height: '450px', backgroundColor: 'cyan' }}/>
        </Impression>
      </div>
    );
  });
