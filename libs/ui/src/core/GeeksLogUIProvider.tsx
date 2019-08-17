import { css, Global } from '@emotion/core';
import { ThemeProvider, withTheme } from 'emotion-theming';
import React, { ReactNode } from 'react';
import { Theme } from '../styles';

const makeGlobalStyles = (theme: Theme) => css`
  body {
    background-color: ${theme.background.background};
    color: ${theme.foreground.text};
  }
`;

const GlobalStyles = withTheme(({ theme }) => (
  <Global styles={makeGlobalStyles(theme)}/>
));

interface Props {
  theme: Theme;
  children: ReactNode;
  className?: string;
}

export function GeeksLogUIProvider({ theme, className, children }: Props) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles/>
      <div className={className}>
        {children}
      </div>
    </ThemeProvider>
  );
}
