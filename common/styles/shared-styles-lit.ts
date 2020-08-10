import {html, unsafeCSS} from 'lit-element';
export const sharedStylesContent = `
  :host {
    display: block;
    box-sizing: border-box;
    font-size: 16px;
  }

  *[hidden] {
    display: none !important;
  }

  h1,
  h2 {
    color: var(--primary-text-color);
    margin: 0;
    font-weight: normal;
  }

  h1 {
    text-transform: capitalize;
    font-size: 24px;
  }

  h2 {
    font-size: 20px;
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
  }

  section {
    background-color: var(--primary-background-color);
  }

  .error {
    color: var(--error-color);
    font-size: 12px;
    align-self: center;
  }

  paper-input-container {
    margin: 0 12px;
    --paper-input-container-focus-color: var(--module-primary);
    --paper-input-container: {
      color: var(--gray-50) !important;
      font-size: 13px;
      opacity: 1 !important;
    }
    --paper-input-container-underline: {
      display: none !important;
    }
    --paper-input-container-underline-focus: {
      display: none;
    }
    --paper-input-container-underline-disabled: {
      display: block !important;
      border-bottom: 1px dashed var(--gray-20) !important;
    }
  }

  etools-dropdown[readonly],
  etools-dropdown-multi[readonly],
  datepicker-lite[readonly],
  paper-input[readonly],
  paper-textarea[readonly] {
    --paper-input-container-underline: {
      display: none;
    }
    --paper-input-container-input-focus: {
      pointer-events: none;
    }
    --paper-input-container-label-focus: {
      pointer-events: none;
      color: var(--secondary-text-color);
    }
    --paper-input-container-underline-focus: {
      display: none;
    }
    --paper-input-container: {
      pointer-events: none;
      cusrsor: text;
    }
    --paper-input-container-label: {
      pointer-events: none;
      color: var(--secondary-text-color, #737373);
      cusrsor: text;
    }
    --esmm-select-cursor: text;
    --esmm-external-wrapper: {
      width: 100%;
    }
  }

  etools-dropdown,
  etools-dropdown-multi {
    --esmm-external-wrapper: {
      width: 100%;
      max-width: 650px;
    }
  }

  :host > * {
    --required-star-style: {
      background: url('./images/required.svg') no-repeat 99% 20%/8px;
      width: auto !important;
      max-width: 100%;
      right: auto;
      padding-right: 15px;
    }
  }

  paper-input,
  paper-textarea,
  paper-input-container,
  datepicker-lite,
  etools-dropdown,
  etools-dropdown-multi,
  etools-upload,
  etools-currency-amount-input {
    --paper-input-container-label: {
      color: var(--secondary-text-color, #737373);
    }
    --paper-input-container-label-floating: {
      color: var(--secondary-text-color, #737373);
    }
  }

  paper-input[required][label],
  paper-textarea[required][label],
  paper-input-container[required],
  datepicker-lite[required],
  etools-dropdown[required],
  etools-dropdown-multi[required],
  etools-upload[required],
  etools-currency-amount-input[required] {
    --paper-input-container-label: {
      @apply --required-star-style;
      color: var(--secondary-text-color, #737373);
    }
    --paper-input-container-label-floating: {
      @apply --required-star-style;
      color: var(--secondary-text-color, #737373);
    }
  }

  etools-dialog paper-textarea {
    --iron-autogrow-textarea: {
      overflow: auto;
      padding: 0;
      max-height: 96px;
    }
  }

  label[required] {
    @apply --required-star-style;
    background: url('./images/required.svg') no-repeat 87% 40%/6px;
  }

  .readonly {
    pointer-events: none;
  }
  .font-bold {
    font-weight: bold;
  }

  .paper-label {
    font-size: 12px;
    color: var(--secondary-text-color);
    padding-top: 8px;
  }

  .input-label {
    min-height: 24px;
    padding-top: 4px;
    min-width: 0;
  }

  .input-label[empty]::after {
    content: '—';
    color: var(--secondary-text-color);
  }

  paper-textarea {
    --paper-input-container-input: {
      display: block;
    }
    --iron-autogrow-textarea: {
      overflow: auto;
      padding: 0;
      max-height: 96px;
    }
  }
  paper-textarea[readonly] {
    --paper-input-container-underline: {
      display: none;
    }
  }
  .w100 {
    width: 100%;
  }
  .header-text {
    font-size: 12px;
    color: var(--list-secondary-text-color, #757575);
    font-weight: bold;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .p-relative {
    position: relative;
  }

  .break-word {
    word-break: break-word;
    word-wrap: break-word; /* for IE */
    width: 100%;
  }

  paper-radio-group:focus,
  paper-textarea[focused] {
    outline: none;
  }

  .readonly {
    pointer-events: none;
  }

  .readonly {
    --paper-radio-button-checked-ink-color: transparent !important;
    --paper-radio-button-unchecked-ink-color: transparent !important;
  }

  etools-data-table-column, *[slot="row-data"] .col-data {
    box-sizing: border-box;
    padding-right: 16px;
  }

  *[slot="row-data"] {
    margin-top: 12px;
    margin-bottom: 12px;
    width: 100%;
  }

  .hidden {
    display: none !important;
  }
`;
export const sharedStyles = html`${unsafeCSS(sharedStylesContent)}`;
