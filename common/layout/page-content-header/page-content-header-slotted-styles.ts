import {css} from 'lit-element';

/**
 * Used to style page content header title row actions child elements
 * (styling slotted content, using ::slotted will not work on Edge)
 */

// language=CSS
export const pageContentHeaderSlottedStyles = css`
  .content-header-actions {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
  @media (max-width: 576px) {
    .content-header-actions {
      display: block;
    }
  }
`;
