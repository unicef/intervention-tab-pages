import {css} from 'lit-element';

export const reportingRequirementsListStyles = css`
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
    visibility: hidden;
  }

  etools-data-table-row:hover .actions {
    visibility: visible;
  }
`;
