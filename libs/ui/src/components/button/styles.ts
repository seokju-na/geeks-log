import { css } from '@emotion/core';
import {
  coerceCssPixelValue,
  keyboardFocusedClassName,
  programFocusedClassName,
} from '@geeks-log/ui-devkit';
import {
  buttonReset,
  fontSizes,
  fontWeights,
  sansSerif,
  selectBackground,
  selectForeground,
  selectPrimary,
  styled,
} from '../../styles';
import { ButtonSize } from './types';

export const buttonSizes: Readonly<Record<ButtonSize, number>> = {
  small: 24,
  regular: 32,
  big: 50,
};

export const buttonRadius = 4;

const fontSizeByFlatButtonSize: Record<ButtonSize, number> = {
  small: fontSizes.regular,
  regular: fontSizes.regular,
  big: fontSizes.medium,
};

export function flatButtonCss(size: ButtonSize) {
  const s = buttonSizes[size];

  return css`
    height: ${coerceCssPixelValue(s)};
    line-height: ${coerceCssPixelValue(s - 2)};
    font-size: ${coerceCssPixelValue(fontSizeByFlatButtonSize[size])};
    font-weight: ${fontWeights.medium};
    padding: 0 ${coerceCssPixelValue(s / 1.33)};
  `;
}

export function iconButtonCss(size: ButtonSize) {
  const s = buttonSizes[size];

  return css`
    width: ${coerceCssPixelValue(s)};
    height: ${coerceCssPixelValue(s)};
    padding: 0;
  `;
}

export const Wrapper = styled.button`
  ${buttonReset};
  
  position: relative;
  
  white-space: nowrap;
  text-decoration: none;
  vertical-align: baseline;
  text-align: center;
  
  margin: 0;
  color: inherit;
  background: transparent;
  
  ${sansSerif};
  
  // Explicitly set the default overflow to \`visible\`. It is already set
  // on most browsers except on IE11 where it defaults to \`hidden\`.
  overflow: visible;
  
  cursor: pointer;
  border: none;
  border-radius: ${coerceCssPixelValue(buttonRadius)};
  
  &.Button--type-flat {
    transform: translateZ(0);
    transition: background-color 225ms ease-in-out;
  
    &.Button--color-normal {
      border: 1px solid ${selectForeground('divider')};
      background-color: ${selectBackground('backgroundHighlighted')};
      
      &:active {
        background-color: ${selectBackground('background')};
      }
    }
  
    &.Button--color-primary {
      border: none;
      color: ${selectPrimary(500, true)};
      background-color: ${selectPrimary(500)};
      
      &:active {
        background-color: ${selectPrimary(300)};
      }
    }
    
    &.Button--size-small {
      ${flatButtonCss('small')};
    }

    &.Button--size-regular {
      ${flatButtonCss('regular')};
    }

    &.Button--size-big {
      ${flatButtonCss('big')};
    }
    
    &.${keyboardFocusedClassName}, &.${programFocusedClassName} {
      box-shadow: 0 0 0 .2em ${selectPrimary(100)};
    }
  }
  
  &.Button--type-icon {
    border: 1px solid transparent;
    border-radius: 17.5%;
    transform: translateZ(0);
    transition: opacity, border-color 225ms ease-in-out;
    
    &.Button--size-small {
      ${iconButtonCss('small')};
    }
    
    &.Button--size-regular {
      ${iconButtonCss('regular')};
    }
    
    &.Button--size-big {
      ${iconButtonCss('big')};
    }
    
    &:active {
      opacity: .65;
    }
    
    &.${keyboardFocusedClassName}, &.${programFocusedClassName}, &:hover {
      border-color: ${selectBackground('focusedButton')};
      box-shadow: 0 0 2px 0 ${selectBackground('focusedButton')};
    }
  }
`;

export const Content = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
