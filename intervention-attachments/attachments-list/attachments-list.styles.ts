import {html} from 'lit';

// language=html
export const AttachmentsListStyles = html`
  <style>
    :host {
      display: block;
    }

    etools-content-panel::part(ecp-content) {
      padding: 0;
      overflow: hidden;
    }

    .attachment {
      margin-inline-end: 8px;
    }
    etools-icon {
      color: var(--dark-icon-color);
    }
    icons-actions {
      visibility: hidden;
    }
    etools-data-table-row:hover icons-actions {
      visibility: visible;
    }
    etools-data-table-row {
      --list-divider-color: var(--light-divider-color);
    }
    .separator {
      border-inline-start: solid 1px var(--light-secondary-text-color);
      padding-inline-end: 10px;
      margin: 6px 0 6px 10px;
    }
    .editable-row {
      margin-top: 0;
      margin-bottom: 0;
      padding: 12px 0;
    }

    etools-data-table-header {
      --list-header-wrapper-column-height: 48px;
    }
    etools-icon-button[name='add-box'] {
      margin-inline-start: 20px;
    }
  </style>
`;
