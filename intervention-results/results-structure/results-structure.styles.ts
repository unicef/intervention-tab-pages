import {css, CSSResult} from 'lit-element';

// language=CSS
export const ResultStructureStyles: CSSResult = css`
  .heading {
    font-size: 12px;
    line-height: 16px;
    color: var(--secondary-text-color);
  }
  .data {
    font-size: 16px;
    line-height: 24px;
    color: var(--primary-text-color);
  }
  .bold-data {
    font-weight: bold;
    font-size: 18px;
  }
  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .text {
    font-size: 12px;
    line-height: 14px;
  }
  .details-heading {
    margin-bottom: 5px;
    color: var(--secondary-text-color);
  }
  .details-text {
    font-size: 13px;
    line-height: 15px;
  }
  .header {
    border: 1px solid var(--main-border-color);
    padding-left: 56px !important;
    padding-right: 12px !important;
  }
  div[slot='row-data'] {
    width: 100%;
  }
  .details-container {
    width: 25%;
  }
  .details-list-item {
    margin-bottom: 3px;
  }
  .add-pd {
    width: 100%;
    height: 57px;
    background-color: var(--secondary-background-color);
    font-size: 12px;
    color: var(--secondary-text-color);
    box-sizing: border-box;
  }
  .add-pd.white {
    border-top: 1px solid var(--main-border-color);
    background-color: var(--primary-background-color);
  }
  .number-data {
    width: 100px;
    margin-left: 10px;
  }
  iron-icon {
    margin: 0 15px;
    opacity: 0.9;
    cursor: pointer;
  }
  iron-icon:hover {
    opacity: 1;
  }
  *[hidden] {
    display: none !important;
  }
  .editable-row {
    position: relative;
  }
  .editable-row.fixed-height {
    height: 55px;
    align-items: center;
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
  .empty-row {
    padding: 16px 12px 16px 56px;
  }
`;
