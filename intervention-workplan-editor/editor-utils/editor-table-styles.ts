import {css} from 'lit-element';

export const EditorTableStyles = css`
  table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
  }
  td {
    border: 1px solid #b8b8b8;
    vertical-align: top;
    padding: 8px 10px;
  }

  td.first-col {
    width: 60px;
    text-align: center;
    vertical-align: middle;
    padding: 6px;
  }
  td.col-10 {
    width: 10%;
  }
  td.col-30 {
    width: 30%;
  }
  td.col-g {
    width: 12.5%;
  }
  td.last-col {
    width: 12.5%;
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
  }
  tr.text > td {
    border-bottom: none;
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

  tbody.odd tr:nth-child(odd) {
    background-color: #eeeeee;
  }

  td:nth-child(n + 4) {
    text-align: right;
  }
  td:nth-child(n-1) {
    border-right: none;
  }
  td.a-right {
    text-align: right;
  }

  .blue {
    background-color: #b6d5f1;
  }
  .gray-1 {
    background-color: #efefef;
  }
  .b {
    font-weight: 600;
  }
  .border-b {
    border-bottom: 1px solid #b8b8b8;
  }

  paper-icon-button {
    color: var(--secondary-text-color);
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
  div.icon {
    display: inline-block;
  }

  div.icon:hover {
    color: #212121;
    cursor: pointer;
  }

  div.icon paper-icon-button:hover {
    color: #212121;
  }

  etools-currency-amount-input {
    text-align: right;
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
  tr.activity-items-row:not(.readonly) > td {
    padding-bottom: 16px;
  }
  tr.activity-items-row.readonly > td {
    padding-top: 1px;
    padding-bottom: 1px;
  }

  .v-middle {
    vertical-align: middle;
  }
  .del-item {
    vertical-align: bottom;
    padding-left: 0;
  }
  paper-icon-button#delItem {
    padding: 0;
    width: 25px;
  }
  .padd-top-15 {
    padding-top: 16px;
  }
`;
