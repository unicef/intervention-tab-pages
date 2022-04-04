import {css, CSSResult} from 'lit-element';

// language=CSS
export const ActivitiesAndIndicatorsStyles: CSSResult = css`
  div[slot='row-data'] {
    min-height: 53px;
  }
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
    padding: 19px 40px 19px 24px !important;
  }
  .table-head {
    padding: 22px 40px 22px 24px !important;
    font-size: 16px;
    font-weight: 700;
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
  }
  .table-row.active .show-actions,
  .table-row:hover .show-actions {
    display: block;
  }
  .table-row.active,
  .table-row:not(.table-head):hover {
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
    font-weight: 700;
    line-height: 26px;
    color: #2073b7;
    text-decoration: underline;
    cursor: pointer;
  }
  div.fixed-cell {
    max-width: 130px;
    min-width: 80px;
    flex: none !important;
    width: 10%;
  }
  div.high-frequency {
    max-width: 60px;
  }
  etools-data-table-row {
    --list-bg-color: var(--main-background);
  }

  etools-data-table-row::part(edt-list-row-collapse-wrapper) {
    padding: 0 !important;
    background-color: var(--main-background);
    border-top: 1px solid var(--main-border-color);
  }
  etools-data-table-row::part(edt-list-row-wrapper) {
    background-color: var(--main-background);
    min-height: 48px;
    border: 1px solid var(--main-background) !important;
    border-bottom: none !important;
  }
  etools-data-table-row::part(edt-icon-wrapper) {
    padding: 0 0 0 38px !important;
    margin-right: 16px !important;
  }

  .editable-row .hover-block {
    background-color: var(--main-background);
  }

  etools-data-table-row::part(edt-list-row-wrapper):hover {
    background-color: var(--main-background);
  }
`;
