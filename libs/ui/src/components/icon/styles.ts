import { css } from '@emotion/core';
import { coerceCssPixelValue } from '@geeks-log/ui-devkit';
import { commonColors, selectForeground, selectPrimary, styled } from '../../styles';
import { IconSize } from './types';

export const iconSizes: Readonly<Record<IconSize, number>> = {
  small: 15,
  regular: 18,
  big: 24,
};

export function iconSizeCss(size: IconSize) {
  const s = iconSizes[size];

  return css`
    width: ${coerceCssPixelValue(s)};
    height: ${coerceCssPixelValue(s)};
    font-size: ${coerceCssPixelValue(s)};
  `;
}

export const Wrapper = styled.i`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  line-height: 1;
  
  &.Icon--size-small {
    ${iconSizeCss('small')};
  }
  
  &.Icon--size-regular {
    ${iconSizeCss('regular')};
  }
  
  &.Icon--size-big {
    ${iconSizeCss('big')};
  }
  
  &.Icon--color-none {
    color: ${selectForeground('icon')};
  }
  
  &.Icon--color-primary {
    color: ${selectPrimary()};
  }
  
  &.Icon--color-white {
    color: ${commonColors.white};
  }
  
  &.Icon--color-black {
    color: ${commonColors.black};
  }
`;
