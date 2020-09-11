import {html} from 'lit-element';

// language=html
export const AttachmentsListStyles = html`
  <style>
    :host {
      display: block;
      --ecp-content: {
        padding: 0;
        overflow: hidden;
      }
    }
    .attachment {
      margin-right: 8px;
    }
    iron-icon {
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
      border-left: solid 1px var(--light-secondary-text-color);
      padding-right: 10px;
      margin: 6px 0 6px 10px;
    }
    .editable-row {
      margin-top: 0;
      margin-bottom: 0;
      padding: 12px 0;
    }
    .editable-row .hover-block {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      line-height: 48px;
      background-color: #eeeeee;
      z-index: 100;
    }
    .editable-row .hover-block paper-icon-button {
      color: rgba(0, 0, 0, 0.54);
      padding-left: 5px;
    }
    .editable-row:hover > .hover-block {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    etools-data-table-header {
      --list-header-wrapper-column-height: 48px;
    }
    paper-icon-button[icon='add-box'] {
      color: var(--secondary-text-color);
      margin-left: 20px;
    }
  </style>
`;
