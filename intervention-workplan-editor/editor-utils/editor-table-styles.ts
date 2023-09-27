import {css} from 'lit';

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
    padding-inline-start: 25px;
  }
  td.a-item-padd {
    padding-inline-start: 25px;
  }
  td.a-item-add-padd {
    padding-inline-start: 15px;
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
    border-inline-start: none;
  }
  tr > td:last-of-type {
    border-inline-end: none;
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
    background-color: #f4f4f4;
  }
  .b {
    font-weight: 600;
  }

  paper-icon-button {
    color: #504e4e;
  }
  sl-icon-button[name='close'] {
    color: red;
    stroke: red;
  }

  etools-currency {
    text-align: right;
  }

  div.icon:hover {
    color: #212121;
    cursor: pointer;
  }
  div.icon {
    max-width: fit-content;
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
    border-inline-start: none;
    border-inline-end: none;
  }

  tr.activity-items-row > td.total {
    border-inline-end: none;
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
    padding-inline-start: 0;
  }

  .padd-top-10 {
    padding-top: 10px;
  }
  tr.no-b-border > td {
    border-bottom: none;
  }
  td.no-l-r-border {
    border-inline-start: none;
    border-inline-end: none;
  }
  td.no-r-border {
    border-inline-end: none;
  }
  td.no-l-border {
    border-inline-start: none;
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

  .eepm-header {
    color: var(--secondary-text-color);
    font-weight: bold;
  }
  tr.eepm-header td {
    border-inline-start: none;
    border-inline-end: none;
  }

  tbody[inEditMode],
  tr[inEditMode] {
    background-color: #b5d5f050 !important;
  }
  etools-currency::part(input) {
    text-align: end;
  }
`;
