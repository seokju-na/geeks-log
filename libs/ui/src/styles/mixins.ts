import { css } from '@emotion/core';

export const buttonReset = css`
  user-select: none;
  cursor: pointer;
  outline: none;
  border: none;
  -webkit-tap-highlight-color: transparent;
  
  // The \`outline: none\` from above works on all browsers, however Firefox also
  // adds a special \`focus-inner\` which we have to disable explicitly. See:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Firefox
  &::-moz-focus-inner {
    border: 0;
  }
`;
