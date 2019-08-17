import _styled, { CreateStyled } from '@emotion/styled';
import {
  BackgroundPalette,
  backgroundPalettes,
  ColorPalette,
  colorPalettes,
  ForegroundPalette,
  foregroundPalettes,
} from './palettes';

export interface Theme {
  readonly primary: ColorPalette;
  readonly warn: ColorPalette;
  readonly isDark: boolean;
  readonly foreground: ForegroundPalette;
  readonly background: BackgroundPalette;
}

export const styled = _styled as CreateStyled<Theme>;

export type PropsWithTheme<T = {}> = T & { theme: Theme };

export function selectColor<T = {}>(
  key: Extract<keyof Theme, 'primary' | 'warn'>,
  hue: Exclude<keyof ColorPalette, 'contrast'> = 500,
  isContrast: boolean = false,
) {
  return (props: PropsWithTheme<T>) => isContrast
    ? props.theme[key].contrast[hue]
    : props.theme[key][hue];
}

export function selectPrimary<T = {}>(
  hue: Exclude<keyof ColorPalette, 'contrast'> = 500,
  isContrast: boolean = false,
) {
  return selectColor<T>('primary', hue, isContrast);
}

export function selectBackground<T = {}>(type: keyof BackgroundPalette) {
  return (props: PropsWithTheme<T>) => props.theme.background[type];
}

export function selectForeground<T = {}>(type: keyof ForegroundPalette) {
  return (props: PropsWithTheme<T>) => props.theme.foreground[type];
}

export const defaultLightTheme: Theme = {
  primary: colorPalettes.blue,
  warn: colorPalettes.red,
  isDark: false,
  foreground: foregroundPalettes.light,
  background: backgroundPalettes.light,
};

export const defaultDarkTheme: Theme = {
  primary: colorPalettes.blue,
  warn: colorPalettes.red,
  isDark: true,
  foreground: foregroundPalettes.dark,
  background: backgroundPalettes.dark,
};
