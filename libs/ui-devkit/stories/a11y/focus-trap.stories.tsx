import { boolean, select } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React, { createElement } from 'react';

import { AutoFocusTarget, FocusTrap, useFocusTrap } from '../../src';

storiesOf('a11y/focus-trap', module)
  .add('hook', () => createElement(() => {
    const enable = boolean('enable', true);
    const autoFocusTarget = select<AutoFocusTarget>('autoFocusTarget', {
      initial: 'initial',
      firstTabbable: 'firstTabbable',
      lastTabbable: 'lastTabbable',
    }, 'initial');

    const ref = useFocusTrap<HTMLDivElement>({ autoFocusTarget, enable });

    return (
      <div>
        <div>
          <h1>Outside</h1>
          <button>Other button</button>
        </div>
        <div ref={ref} style={{ border: `4px solid ${enable ? 'lightGreen' : 'black'}`, padding: 16 }}>
          <h1>Inside</h1>
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </div>
      </div>
    );
  }))
  .add('component', () => {
    const enable = boolean('enable', true);
    const autoFocusTarget = select<AutoFocusTarget>('autoFocusTarget', {
      initial: 'initial',
      firstTabbable: 'firstTabbable',
      lastTabbable: 'lastTabbable',
    }, 'initial');

    return (
      <div>
        <div>
          <h1>Outside</h1>
          <button>Other button</button>
        </div>
        <FocusTrap enable={enable} autoFocusTarget={autoFocusTarget}>
          <h1>Inside</h1>
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </FocusTrap>
      </div>
    )
  });
