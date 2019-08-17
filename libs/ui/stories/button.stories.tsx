import { css } from '@emotion/core';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { Button, Icon } from '../src';

storiesOf('Button', module)
  .add('default', () => {
    return (
      <div
        style={{ padding: '12px 4px', display: 'flex', alignItems: 'center' }}
        css={css` & > button { margin: 0 4px; } `}
      >
        <Button color="normal">Normal</Button>
        <Button color="primary">Primary</Button>
        <Button type="icon">
          <Icon name="search-line" />
        </Button>
      </div>
    );
  });
