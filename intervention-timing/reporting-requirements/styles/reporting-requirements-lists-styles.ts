import {css} from 'lit';

export const reportingRequirementsListStyles = css`
  *[hidden] {
    display: none !important;
  }

  :host {
    display: block;
  }

  :host([with-scroll]) {
    max-height: 500px;
    overflow-y: auto;
    height: auto;
    min-height: 300px;
  }

  .col-data.index-col,
  etools-data-table-column.index-col {
    padding-inline-end: 48px !important;
  }

  .col-data.right-align {
    justify-content: flex-end;
  }

  .actions {
    position: relative;
    visibility: hidden;
  }

  etools-data-table-row:hover .actions {
    visibility: visible;
  }
`;
