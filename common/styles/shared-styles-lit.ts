import {css, unsafeCSS} from 'lit-element';
// language=css
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
  paper-textarea[readonly],
  etools-currency-amount-input[readonly] {
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
      cursor: text;
    }
    --paper-input-container-label: {
      pointer-events: none;
      color: var(--secondary-text-color, #737373);
      cursor: text;
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

  etools-dropdown-multi[required]::part(esmm-label),
  etools-dropdown[required]::part(esmm-label) {
    @apply --required-star-style;
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

  .font-bold-12 {
    font-weight: bold;
    font-size: 12px;
    color: var(--primary-text-color);
  }

  paper-textarea {
    --paper-input-container-input: {
      display: block;
    }
    --iron-autogrow-textarea: {
      overflow: hidden;
      padding: 0;
    }
  }

  etools-dialog paper-textarea {
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
  paper-textarea[focused],
  .nav-menu-item {
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

  .col-data.actions {
    height: 24px;
  }

  .hidden {
    display: none !important;
  }

  etools-content-panel::part(ecp-header) {
      background-color: var(--primary-background-color);
      border-bottom: 1px groove var(--dark-divider-color);
  }

  etools-content-panel::part(ecp-header-title) {
      padding: 0 24px 0 0;
      text-align: start;
      font-size: 18px;
      font-weight: 500;
  }

  etools-content-panel::part(ecp-content) {
      padding: 0;
  }

  .editable-row .hover-block {
    opacity: 0;
    display: flex;
    align-items: center;
    cursor: pointer;
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
      opacity: 1;
  }

  .editable-row:focus-within .hover-block {
    opacity: 1;
  }

  etools-data-table-row {
    --list-second-bg-color: rgba(204, 204, 204, 0.3);
  }

  .paper-label {
    font-size: 12px;
    color: var(--secondary-text-color);
    padding-top: 6px;
  }

  .input-label {
    min-height: 24px;
    padding-top: 4px;
    padding-bottom: 6px;
    min-width: 0;
    font-size: 16px;
  }

  .input-label[empty]::after {
    content: '—';
    color: var(--secondary-text-color);
  }

  etools-dialog {
    --esmm-dropdown-menu-position: fixed !important;
  }

  .padd-between:not(:last-child) {
    padding-bottom: 6px;
  }

  .lifted-up-icon {
    bottom: 0.4rem;
    --iron-icon-width: 14px;
    --iron-icon-height: 14px;
  }

  .secondary-btn:focus {
    outline: 0;
    box-shadow:  0 0 10px 10px rgba(170, 165, 165, 0.2) !important;
    background-color: rgba(170, 165, 165, 0.2);
  }

  a:focus {
    outline: 0;
    box-shadow:  0 0 10px 10px rgba(170, 165, 165, 0.2) !important;
    background-color: rgba(170, 165, 165, 0.2);
  }

  *[disabled] {
    outline: 0;
  }

  etools-dialog::part(ed-title) {
      border-bottom: solid 1px var(--dark-divider-color);
  }

  etools-dialog::part(ed-scrollable) {
    margin-top: 0 !important;
    padding-top: 12px;
    padding-bottom: 16px;
  }

  etools-dialog::part(ed-button-styles) {
    margin-top: 0;
  }
`;
// export const sharedStyles = html`${unsafeCSS(sharedStylesContent)}`;
export const sharedStyles = css`
  ${unsafeCSS(sharedStylesContent)}
`;

export const sharedStylesPolymer = () => {
  const template = document.createElement('template');
  template.innerHTML = `<style>
    ${sharedStylesContent}
   </style>`;
  return template;
};
