import {css, CSSResult} from 'lit-element';

// language=CSS
export const ActivitiesAndIndicatorsStyles: CSSResult = css`
  .title-text {
    font-size: 16px;
    font-weight: 500;
    line-height: 26px;
  }
  .table-row {
    display: flex;
    position: relative;
    gap: 10px;
    font-size: 16px;
    font-weight: 400;
    line-height: 26px;
    color: #212121;
    padding: 6px 16px;
  }
  .table-head {
    padding: 4px 16px !important;
    font-size: 16px;
    line-height: 16px;
    color: #5c5c5c;
  }
  .table-row > div {
    text-align: center;
    flex: 1;
    min-width: 0;
  }
  .show-actions {
    position: absolute;
    display: none;
    top: 0;
    right: 0;
    z-index: 999;
  }
  .table-row.active .show-actions,
  .table-row:hover .show-actions {
    display: block;
  }
  .table-row.active,
  .table-row:not(.table-head, .empty):hover {
    background-color: var(--main-background-dark);
  }
  pd-indicator:not(:last-child):after,
  .table-row:not(:last-child):not(.table-head):after {
    content: '';
    display: block;
    position: absolute;
    width: calc(100% - 14px);
    left: 7px;
    bottom: 0;
    height: 1px;
    background-color: #c4c4c4;
  }
  .secondary-cell {
    max-width: 15%;
    min-width: 110px;
    display: flex;
    justify-content: center;
  }
  .secondary-cell.left {
    justify-content: flex-start;
  }
  .secondary-cell.right {
    justify-content: right;
  }
  div.left-align {
    text-align: left;
  }
  .action {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 400;
    line-height: 19px;
    padding: 10px 14px;
    color: #000000;
    white-space: nowrap;
    text-align: left;
    cursor: pointer;
  }
  .action iron-icon {
    margin: 0 11px 0 0;
  }
  .action:hover {
    background-color: var(--secondary-background-color);
  }
  .delete-action {
    color: #e14f4f;
  }
  .item-link {
    margin-top: 7px;
    font-size: 16px;
    line-height: 26px;
    color: #5c5c5c;
    cursor: pointer;
    text-transform: lowercase;
  }
  etools-data-table-row {
    --list-bg-color: var(--main-background);
  }

  etools-data-table-row::part(edt-list-row-collapse-wrapper) {
    padding: 0 !important;
    background-color: var(--primary-background-color);
    border-top: 1px solid var(--main-border-color);
  }
  etools-data-table-row::part(edt-list-row-wrapper) {
    background-color: var(--main-background);
    min-height: 48px;
    border: 1px solid var(--main-background) !important;
    border-bottom: none !important;
  }
  etools-data-table-row::part(edt-icon-wrapper) {
    padding: 0 8px 0 13px;
  }

  .editable-row .hover-block {
    background-color: var(--main-background);
    bottom: 1px;
  }

  .editable-row .hover-block paper-menu-button {
    padding: 0;
  }

  etools-data-table-row::part(edt-list-row-wrapper):hover {
    background-color: var(--main-background);
  }
`;
