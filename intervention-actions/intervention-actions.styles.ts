import {css, CSSResult} from 'lit-element';

// language=css
export const InterventionActionsStyles: CSSResult = css`
  :host {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    --green-color: #009688;
    --light-green-color: #00b3a1;
    --back-color: #233944;
    --cancel-color: #828282;
  }

  .main-button {
    height: 36px;
    padding: 0 18px;
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
    margin-left: 10px;
  }

  .cancel-background {
    background: var(--cancel-color);
  }

  .reject-button {
    background: var(--reject-color);
  }

  .main-button.with-additional {
    padding: 0 0 0 18px;
  }

  .main-button.with-additional span {
    margin-right: 15px;
  }

  .main-button span {
    margin-right: 7px;
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
    border-left: 2px solid rgba(255, 255, 255, 0.12);
  }
  @media (max-width: 770px) {
    :host {
      flex-direction: column !important;
      align-items: center;
    }
  }
`;
