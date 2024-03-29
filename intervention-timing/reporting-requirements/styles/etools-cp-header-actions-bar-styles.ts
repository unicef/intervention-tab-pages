import {css, unsafeCSS} from 'lit-element';

export const etoolsCpHeaderActionsBarStyles = `
    .cp-header-actions-bar {
    @apply --layout-horizontal;
  }

  .cp-header-actions-bar paper-icon-button[disabled] {
    visibility: hidden;
  }

  .cp-header-actions-bar paper-toggle-button {
    --paper-toggle-button-label-color: white;
    --paper-toggle-button-checked-bar-color: white;
    padding-inline-end: 10px;
    font-size: 16px;
  }

  .cp-header-actions-bar .separator {
    border-inline-start: solid 1px var(--light-secondary-text-color);
    padding-inline-end: 10px;
    margin: 6px 0;
    margin-inline-start: 10px;
  }
  `;

// language=CSS
export const etoolsCpHeaderActionsBarStylesLit = css`
  ${unsafeCSS(etoolsCpHeaderActionsBarStyles)}
`;
