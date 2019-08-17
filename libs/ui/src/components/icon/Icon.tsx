import classNames from 'classnames';
import React, { memo } from 'react';
import { Wrapper } from './styles';
import { IconColor, IconSize } from './types';

interface Props {
  name: string;
  /** @default 'regular' */
  size?: IconSize;
  /** @default 'none' */
  color?: IconColor;
  ariaLabel?: string;
  ariaHidden?: boolean;
}

export const Icon = memo<Props>(({
  name,
  size = 'regular',
  color = 'none',
  ariaLabel,
  ariaHidden,
}) => {
  return (
    <Wrapper
      role="img"
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      className={classNames(`remixicon-${name} ri-1x`, 'Icon', {
        [`Icon--size-${size}`]: true,
        [`Icon--color-${color}`]: true,
      })}
    />
  );
});
