import {css, CSSResult, html, TemplateResult} from 'lit-element';

// language=css
export const ActivityItemsTableStyles: CSSResult = css`
  :host {
    display: block;
    background-color: var(--secondary-background-color);
  }
  .grid-row {
    display: grid;
    grid-template-columns: auto 108px 130px 120px 140px 120px 120px 140px 16px;
    min-height: 47px;
    padding: 0 2px 0 2px;
  }
  div.grid-cell {
    display: flex;
    align-items: center;
    padding: 8px 4px;
    box-sizing: border-box;
    font-weight: normal;
    font-size: 13px;
    letter-spacing: -0.1px;
    color: var(--primary-text-color);
  }
  .remove {
    padding: 0px !important;
  }

  @media (max-width: 1100px) {
    div.header {
      display: none;
    }
    .grid-row {
      display: flex;
      flex-direction: column;
    }
    div.grid-cell {
      width: 100%;
      max-width: 100%;
      padding: 8px 0;
      box-sizing: border-box;
    }
    div.grid-cell:before {
      content: attr(data-col-header-label) ': ';
      color: var(--list-secondary-text-color, #757575);
      font-weight: bold;
      margin-right: 8px;
      margin-left: 8px;
      white-space: nowrap;
      min-width: 160px;
      width: 160px;
    }
    .end {
      justify-content: flex-start !important;
    }
    .remove {
      padding: 6px 0px !important;
      border-bottom: 1px solid var(--darker-divider-color);
    }
    .last-cell {
      border-bottom: 2px solid var(--darker-divider-color);
      margin-bottom: 30px;
    }
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
  paper-textarea:focus {
    box-shadow: none;
    background-color: transparent;
  }
  label[required] {
    --required-star-style_-_padding-right: 20px;
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
      text-align: right;
      cursor: pointer;
    }
    @media (max-width: 1100px) {
      :host paper-textarea,
      :host paper-input {
        width: calc(100% - 190px);
      }
      :host etools-currency-amount-input {
        width: 140px;
      }
      :host .total {
        width: 140px;
        text-align: right;
      }
    }
  </style>
`;
