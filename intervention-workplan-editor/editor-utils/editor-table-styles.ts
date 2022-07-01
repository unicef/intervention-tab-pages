import {css} from 'lit-element';

export const EditorTableStyles = css`
  * {
    box-sizing: border-box;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    box-sizing: border-box;
    background-color: white;
  }
  td {
    border: 1px solid #b8b8b8;
    vertical-align: top;
    padding: 6px 10px;
  }

  td.first-col {
    width: 90px;
    text-align: left;
    vertical-align: middle;
    padding: 6px;
  }
  td.col-unit-no {
    width: 7%;
  }
  td.col-unit {
    width: 7%;
  }
  td.col-text {
    width: calc(47% - 85px);
  }
  td.col-g {
    width: 10%;
  }
  td.col-p-per-unit {
    width: 9%;
  }
  td.last-col {
    width: 10%;
    vertical-align: top;
    text-align: right;
  }
  tr.edit > td {
    height: 30px;
    border-bottom: none;
    padding: 4px !important;
  }
  tr.header > td {
    color: var(--secondary-text-color);
    vertical-align: middle;
    border-bottom: none;
    border-top: none;
    font-size: smaller;
    font-weight: bold;
    padding-bottom: 2px !important;
    padding-top: 18px;
  }
  tr.header.no-padd > td {
    padding-top: 4px;
  }
  tr.text > td {
    border-top: none;
  }

  tr.add > td {
    border-top: none;
  }

  tr > td:first-of-type {
    border-left: none;
  }
  tr > td:last-of-type {
    border-right: none;
  }

  td:nth-child(n + 4) {
    text-align: right;
  }

  td.a-right {
    text-align: right;
  }

  td.a-center {
    text-align: center;
  }

  .gray-1 {
    background-color: #e4e4e4;
  }
  .b {
    font-weight: 600;
  }

  paper-icon-button {
    color: #504e4e;
  }
  paper-icon-button[icon='close'] {
    color: red;
  }
  paper-icon-button[icon='delete']:hover {
    color: #212121;
  }
  paper-icon-button[icon='create']:hover {
    color: #212121;
  }

  paper-icon-button:hover {
    color: #212121;
  }

  etools-currency-amount-input {
    text-align: right;
  }

  div.icon:hover {
    color: #212121;
    cursor: pointer;
  }
  div.icon {
    max-width: fit-content;
  }

  paper-button {
    color: white;
    background-color: var(--primary-color);
    padding: 5px;
    border-radius: 7px;
  }

  .pad-top-8 {
    padding-top: 8px;
  }

  .flex-h {
    display: flex;
  }
  .justify-right {
    justify-content: flex-end;
  }
  .justify-center {
    justify-content: center;
  }
  .flex-none {
    flex: none;
  }
  tr.activity-items-row:not(.readonly-mode) > td {
    padding-bottom: 16px;
  }
  tr.activity-items-row.readonly-mode > td {
    padding-top: 1px;
    padding-bottom: 1px;
  }

  tr.activity-items-row.readonly-mode > td:last-of-type {
    border-left: none;
    border-right: none;
  }

  tr.activity-items-row > td.total {
    border-right: none;
    --paper-input-container-input_-_font-weight: 600;
  }
  tr.activity-items-row > td {
    vertical-align: bottom;
  }
  tr.activity-items-row:last-of-type {
    border-bottom: 1px solid #b8b8b8 !important;
  }

  .v-middle {
    vertical-align: middle;
  }
  .del-item {
    vertical-align: bottom;
    padding-left: 0;
  }

  .padd-top-10 {
    padding-top: 10px;
  }
  tr.no-b-border > td {
    border-bottom: none;
  }
  td.no-l-r-border {
    border-left: none;
    border-right: none;
  }
  td.no-r-border {
    border-right: none;
  }
  td.no-l-border {
    border-left: none;
  }
  .no-top-padding {
    padding-top: 0;
  }

  .heavy-blue {
    background-color: #a6dbff;
  }

  .lighter-blue {
    background-color: #ccebff;
  }

  .red {
    color: red;
  }
  .space-for-err-msg {
    padding-bottom: 8px;
  }
  .row-for-fixed-table-layout {
    visibility: collapse;
  }

  *[input][readonly] {
    pointer-events: none;
  }
`;
