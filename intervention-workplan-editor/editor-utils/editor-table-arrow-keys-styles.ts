import {css} from 'lit-element';

export const EditorTableArrowKeysStyles = css`
  tbody > tr > td[tabindex]:focus {
    outline: 3px groove var(--primary-color);
  }
  tbody > tr > td[tabindex]:focus-within {
    outline: 3px groove var(--primary-color);
  }
`;
