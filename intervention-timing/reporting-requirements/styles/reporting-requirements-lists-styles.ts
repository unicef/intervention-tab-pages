import {css, unsafeCSS} from 'lit-element';

export const reportingRequirementsListStyles = `
    *[hidden] {
      display: none !important;
    }

    :host {
      display: block;
    }

    :host([with-scroll]) {
      max-height: 351px;
      overflow-y: auto;
    }

    .col-data.index-col,
    etools-data-table-column.index-col {
      padding-right: 48px !important;
    }

    .actions {
      position: relative;
    }
  `;

// language=CSS
export const reportingRequirementsListStylesLit = css`
  ${unsafeCSS(reportingRequirementsListStyles)}
`;
