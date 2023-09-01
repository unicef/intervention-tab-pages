import {css, CSSResult} from 'lit';

// language=css
export const InterventionActionsStyles: CSSResult = css`
  :host {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0px 30px;
    --green-color: #009688;
    --light-green-color: #00b3a1;
    --back-color: #233944;
    --cancel-color: #828282;
  }

  :host > *:not(export-intervention-data) {
    margin-top: 7px;
    margin-bottom: 7px;
  }

  .main-button {
    --sl-color-primary-600: var(--green-color);
    --sl-color-primary-500: var(--green-color);
  }

  .back-button {
    --sl-color-primary-600: var(--back-color);
    --sl-color-primary-500: var(--back-color);
  }

  .back-button span {
    margin-inline-start: 10px;
  }

  :host-context([dir='rtl']) .main-button.back-button svg {
    transform: scaleX(-1);
  }

  .cancel-background {
    --sl-color-primary-600: var(--cancel-color);
    --sl-color-primary-500: var(--cancel-color);
  }

  .reject-button {
    --sl-color-primary-600: var(--reject-color);
    --sl-color-primary-500: var(--reject-color);
  }

  .main-button.with-additional::part(label) {
    padding-inline-end: 0;
  }

  .main-button.with-additional span {
    margin-inline-end: 12px;
  }

  .main-button span {
    margin-inline-end: 7px;
    vertical-align: middle;
    line-height: 36px;
  }

  sl-menu-item {
    --sl-font-weight-normal: bold;
  }

  paper-menu-button {
    padding: 8px 2px;
    margin-inline-start: 10px;
  }

  paper-button {
    z-index: 10;
  }
  .option-button {
    height: 36px;
    border-inline-start: 2px solid rgba(255, 255, 255, 0.12);
  }

  export-intervention-data {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    inset-inline-end: 10px;
    z-index: 100;
  }
`;
