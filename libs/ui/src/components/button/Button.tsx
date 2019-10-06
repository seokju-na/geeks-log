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
  buttonType?: 'button' | 'submit' | 'reset';
  showSpinner?: boolean;
  removeChildrenWhenShowSpinner?: boolean;
  children?: ReactNode;
}

export function Button({
  children,
  showSpinner = false,
  removeChildrenWhenShowSpinner = false,
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
      type={buttonType}
      className={classNames('Button', {
        [`Button--type-${type}`]: true,
        [`Button--size-${size}`]: true,
        [`Button--color-${color}`]: true,
      }, className)}
      {...otherProps}
    >
      {showSpinner ? <Spinner color="white"/> : null}
      {showSpinner && removeChildrenWhenShowSpinner ? null : <Content>{children}</Content>}
    </Wrapper>
  );
}
