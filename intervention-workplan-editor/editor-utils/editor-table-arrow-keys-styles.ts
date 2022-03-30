import {css} from 'lit-element';

export const EditorTableArrowKeysStyles = css`
  tbody > tr > td[focusable]:focus {
    outline: 4px groove var(--primary-color);
  }
`;
