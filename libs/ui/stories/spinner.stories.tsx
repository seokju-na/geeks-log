import { select, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { Spinner, SpinnerColor, SpinnerSize } from '../src';

storiesOf('Spinner', module)
  .add('default', () => {
    const color = select<SpinnerColor>('color', {
      primary: 'primary',
      white: 'white',
    }, 'primary');
    const size = select<SpinnerSize>('size', {
      small: 'small',
      regular: 'regular',
      big: 'big',
      extraBig: 'extraBig',
    }, 'regular');
    const sizeInPixelValue = text('sizeInPixelValue', null);
    const stepText = text('stepText', 'Step1. Build something...');

    return (
      <Spinner
        color={color}
        size={size}
        sizeInPixelValue={sizeInPixelValue}
        stepText={stepText}
      />
    );
  });
