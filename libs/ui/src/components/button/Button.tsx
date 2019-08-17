import { useFocusMonitor } from '@geeks-log/ui-devkit';
import classNames from 'classnames';
import React, { HTMLProps, ReactNode } from 'react';
import { Spinner } from '../spinner';
import { Content, Wrapper } from './styles';
import { ButtonColor, ButtonSize, ButtonType } from './types';

interface Props extends Omit<HTMLProps<HTMLButtonElement>, 'size' | 'type'> {
  /** @default 'normal' */
  color?: ButtonColor;
  /** @default 'regular' */
  size?: ButtonSize;
  /** @default 'flat' */
  type?: ButtonType;
  buttonType?: HTMLProps<HTMLButtonElement>['type'];
  showSpinner?: boolean;
  children?: ReactNode;
}

export function Button({
  children,
  showSpinner,
  color = 'normal',
  size = 'regular',
  type = 'flat',
  buttonType,
  className,
  ...otherProps
}: Props) {
  const ref = useFocusMonitor<HTMLButtonElement>({ checkChildren: true });

  return (
    <Wrapper
      ref={ref}
      color={color}
      type={buttonType as any}
      className={classNames('Button', {
        [`Button--type-${type}`]: true,
        [`Button--size-${size}`]: true,
        [`Button--color-${color}`]: true,
      }, className)}
      {...otherProps}
    >
      {showSpinner ? <Spinner color="white"/> : null}
      <Content>{children}</Content>
    </Wrapper>
  );
}

