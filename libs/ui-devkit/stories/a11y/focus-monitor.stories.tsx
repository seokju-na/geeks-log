import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React, { createElement } from 'react';

import { useFocusMonitor } from '../../src';

storiesOf('a11y/focus-monitor', module)
  .add('default', () => createElement(() => {
    const ref = useFocusMonitor<HTMLButtonElement>({
      onFocusChange(origin) {
        action(`focus origin changed`)(origin);
      },
    });

    return (
      <>
        <button ref={ref}>FOCUS MONITORED</button>
        <button>NOT MONITORING</button>
      </>
    );
  }));