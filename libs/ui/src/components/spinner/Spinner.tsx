import { coerceCssPixelValue } from '@geeks-log/ui-devkit';
import React, { memo, useMemo } from 'react';
import { commonColors, PropsWithTheme, selectPrimary, styled } from '../../styles';
import { isEmptyValue } from '../../utils';

export type SpinnerSize = 'small' | 'regular' | 'big' | 'extraBig';
export type SpinnerColor = 'primary' | 'white';

export const spinnerSizesInPixel: Readonly<Record<SpinnerSize, number>> = {
  small: 18,
  regular: 24,
  big: 36,
  extraBig: 48,
};

interface Props {
  /** @default 'regular' */
  size?: SpinnerSize;
  /** If this prop is defined, 'size' prop will ignored. */
  sizeInPixelValue?: any;
  /** @default 'primary' */
  color?: SpinnerColor;
  stepText?: string;
}

export const Spinner = memo<Props>(({ size = 'regular', sizeInPixelValue, color = 'primary', stepText }) => {
  const _size = useMemo(() => {
    if (!isEmptyValue(sizeInPixelValue)) {
      return sizeInPixelValue;
    }
    return spinnerSizesInPixel[size];
  }, [size, sizeInPixelValue]);

  return (
    <Progress
      color={color}
      size={coerceCssPixelValue(_size)}
      role="progressbar"
      aria-valuetext={stepText}
    />
  );
});

interface ProgressProps {
  color: SpinnerColor;
  size: string;
}

function selectSpinnerColor() {
  return (props: PropsWithTheme<ProgressProps>) => {
    if (props.color === 'white') {
      return commonColors.white;
    }
    return selectPrimary(500)(props);
  };
}

const Progress = styled.div<ProgressProps>`
  border-radius: 50%;
  width: ${props => props.size};
  height: ${props => props.size};
  font-size: ${props => props.size};
  text-indent: -9999em;
  border-top: .11em solid rgba(255, 255, 255, 0.2);
  border-right: .11em solid rgba(255, 255, 255, 0.2);
  border-bottom: .11em solid rgba(255, 255, 255, 0.2);
  border-left: .11em solid ${selectSpinnerColor};
  transform: translateZ(0);
  animation: spinner 1.1s infinite linear;

  @keyframes spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
