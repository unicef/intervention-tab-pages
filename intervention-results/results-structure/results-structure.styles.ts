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
    font-size: 16px;
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
    padding-left: 10px;
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
    height: 48px;
    align-items: center;
  }
  div[slot='row-data'] {
    margin: 0px;
    min-height: 48px;
  }
  div[slot='row-data'] > div {
    line-height: 48px;
  }
  .higher-slot {
    margin: 0px;
    min-height: 65px !important;
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
`;
