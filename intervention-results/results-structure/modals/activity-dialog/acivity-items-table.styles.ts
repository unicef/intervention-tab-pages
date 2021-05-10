import {css, CSSResult, html, TemplateResult} from 'lit-element';

// language=css
export const ActivityItemsTableStyles: CSSResult = css`
  :host {
    display: block;
    background-color: var(--secondary-background-color);
  }
  .grid-row {
    display: grid;
    grid-template-columns: auto 50px 90px 100px 110px 110px 110px 14px 110px;
    min-height: 47px;
  }
  div.grid-cell {
    display: flex;
    align-items: center;
    padding: 10px 5px;
    box-sizing: border-box;
    font-weight: normal;
    font-size: 13px;
    letter-spacing: -0.1px;
    color: var(--primary-text-color);
  }
  div.header {
    min-height: 56px;
  }
  div.header-cell {
    font-weight: 500;
    font-size: 12px;
    color: var(--secondary-text-color);
  }
  .center {
    justify-content: center;
  }
  .end {
    justify-content: flex-end;
  }
  .border {
    border-bottom: 1px solid var(--darker-divider-color);
  }
  *:focus {
    outline: 0;
    box-shadow: 0 0 5px 5px rgba(170, 165, 165, 0.4);
    background-color: rgba(170, 165, 165, 0.4);
  }
`;

export const ActivityItemsTableInlineStyles: TemplateResult = html`
  <style>
    :host etools-currency-amount-input,
    :host paper-textarea,
    :host paper-input {
      width: 100%;
      margin-top: 1px;
      --paper-input-container: {
        padding: 0;
      }
      --paper-input-container-input: {
        display: block;
      }
      --paper-input-container-shared-input-style: {
        font-size: 13px;
        min-height: 17px;
        line-height: 17px;
        width: 100%;
      }
      --paper-input-container-underline: {
        display: none;
      }
      --iron-autogrow-textarea: {
        cursor: pointer;
      }
      --paper-input-prefix: {
        display: none;
      }
    }
    :host etools-currency-amount-input {
      text-align: center;
      cursor: pointer;
    }
  </style>
`;
