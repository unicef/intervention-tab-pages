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
  td.col-6 {
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
    background-color: #e2e1e1;
  }

  td:nth-child(n + 3) {
    text-align: right;
  }

  .blue {
    background-color: #b6d5f1;
  }
  .gray-1 {
    background-color: #eae9e9;
  }
  .b {
    font-weight: 600;
  }
  .border-b {
    border-bottom: 1px solid #b8b8b8;
  }

  paper-icon-button[icon='add-box'] {
    padding-left: 0;
  }
  paper-icon-button[icon='create'] {
    padding-top: 0;
  }
  paper-icon-button {
    color: var(--secondary-text-color);
  }
  paper-icon-button[icon='close'] {
    color: red;
  }

  paper-textarea {
    --paper-input-container-label-floating: {
      font-weight: 600 !important;
      color: var(--secondary-text-color);
    }
    --paper-input-container-label-floating_-_font-weight: 600;
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
  tr.activity-items-row > td {
    padding-bottom: 16px;
  }

  .v-middle {
    vertical-align: middle;
  }
  .padd-top-40 {
    padding-top: 40px;
  }
`;
