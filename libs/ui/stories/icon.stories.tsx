import { css } from '@emotion/core';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { Icon } from '../src';

storiesOf('Icon', module)
  .add('default', () => {
    return (
      <div
        style={{ padding: '12px 4px', display: 'flex', alignItems: 'center' }}
        css={css` & > .Icon { margin: 0 4px; } `}
      >
        <Icon name="home-line"/>
        <Icon name="home-3-fill"/>
        <Icon name="search-line"/>
      </div>
    );
  });
