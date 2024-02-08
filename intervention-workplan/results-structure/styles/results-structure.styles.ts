import {css, CSSResult} from 'lit';

// language=CSS
export const ResultStructureStyles: CSSResult = css`
  :host {
    --pd-output-background: #ccebff;
    --cp-output-background: #a6dbff;
  }
  .heading {
    font-size: var(--etools-font-size-12, 12px);
    line-height: 16px;
    color: var(--secondary-text-color);
  }
  .data {
    font-size: var(--etools-font-size-16, 16px);
    line-height: 24px;
    color: var(--primary-text-color);
  }
  .total-cache .heading {
    font-size: var(--etools-font-size-14, 14px);
    margin-bottom: 10px;
    text-align: right;
  }
  .total-cache .data {
    font-size: var(--etools-font-size-20, 20px);
    font-weight: 900;
    line-height: 23px;
    text-align: right;
  }
  .total-cache .currency {
    margin-inline-end: 4px;
    font-size: var(--etools-font-size-16, 16px);
    font-weight: 400;
    line-height: 19px;
  }
  .bold-data {
    font-weight: bold;
    font-size: var(--etools-font-size-16, 16px);
  }
  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .text {
    font-size: var(--etools-font-size-12, 12px);
    line-height: 14px;
  }
  .details-heading {
    margin-bottom: 5px;
    color: var(--secondary-text-color);
  }
  .details-text {
    font-size: var(--etools-font-size-13, 13px);
    line-height: 15px;
  }
  .header {
    border: 1px solid var(--main-border-color);
    border-top: none;
    border-bottom: none;
    padding-inline: 56px 12px !important;
    padding-block: 12px !important;
  }
  div[slot='row-data'] {
    width: 100%;
    min-width: 0;
  }
  .details-container {
    flex: 30%;
    padding-inline-start: 10px;
  }
  .details-container-locations {
    flex: 40%;
  }
  .details-list-item {
    margin-bottom: 3px;
  }
  .add-pd {
    width: 100%;
    height: 48px;
    background-color: var(--secondary-background-color);
    font-size: var(--etools-font-size-12, 12px);
    color: var(--secondary-text-color);
    box-sizing: border-box;
  }
  .add-pd.white {
    border-top: 1px solid var(--main-border-color);
    background-color: var(--primary-background-color);
  }
  etools-icon {
    margin: 0 15px;
    opacity: 0.9;
    cursor: pointer;
  }
  etools-icon:hover {
    opacity: 1;
  }
  *[hidden] {
    display: none !important;
  }
  .editable-row {
    position: relative;
  }
  .editable-row.fixed-height {
    height: 48px;
    align-items: center;
  }
  div[slot='row-data'] {
    margin: 0;
  }
  .empty-row {
    padding-inline: 56px 16px;
    padding-block: 12px 16px;
    border-bottom: 1px solid var(--main-border-color);
    border-top: 1px solid var(--main-border-color);
  }
  div[slot='panel-btns'] {
    opacity: 1;
  }
  .add-button {
    display: flex;
    width: min-content;
    align-items: center;
    padding: 5px 5px 0;
    cursor: pointer;
    font-size: var(--etools-font-size-15, 15px);
    line-height: 18px;
    color: #444444;
    white-space: nowrap;
  }
  .add-button:hover {
    color: #212121;
  }
  div.editable-row .hover-block {
    background: linear-gradient(270deg, var(--cp-output-background) 71.65%, rgba(196, 196, 196, 0) 100%);
    padding-inline-start: 20px;
  }
  etools-icon-button.add {
    color: #444444;
    margin-inline-start: -7px;
  }
  etools-icon-button.add:hover {
    color: #212121;
  }
`;
