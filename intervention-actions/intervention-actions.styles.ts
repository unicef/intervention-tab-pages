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
    height: 36px;
    padding-inline-start: 18px;
    padding-inline-end: 18px;
    color: white;
    background: var(--green-color);
    font-weight: 500;
    text-transform: uppercase;
    border-radius: 3px;
  }

  .back-button {
    background: var(--back-color);
  }

  .back-button span {
    margin-inline-start: 10px;
  }

  :host-context([dir='rtl']) .main-button.back-button svg {
    transform: scaleX(-1);
  }

  .cancel-background {
    background: var(--cancel-color);
  }

  .reject-button {
    background: var(--reject-color);
  }

  .main-button.with-additional {
    padding-inline-end: 0 !important;
    padding-inline-start: 18px;
  }

  .main-button.with-additional span {
    margin-inline-end: 15px;
  }

  .main-button span {
    margin-inline-end: 7px;
    vertical-align: middle;
    line-height: 36px;
  }

  .other-options {
    padding: 10px 24px;
    color: var(--primary-text-color);
    white-space: nowrap;
  }

  .other-options:hover {
    background-color: var(--secondary-background-color);
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
