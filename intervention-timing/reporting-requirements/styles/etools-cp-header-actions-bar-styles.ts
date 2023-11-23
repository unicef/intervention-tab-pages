import {css, unsafeCSS} from 'lit';

export const etoolsCpHeaderActionsBarStyles = `
  .cp-header-actions-bar {
      display: flex;
  }

  .cp-header-actions-bar etools-icon-button[disabled] {
    visibility: hidden;
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
