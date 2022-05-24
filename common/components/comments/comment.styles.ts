import {css, CSSResult} from 'lit-element';

// language=css
export const CommentStyles: CSSResult = css`
  :host {
    display: flex;
    background: var(--secondary-background-color);
    border-radius: 20px;
    padding: 12px;
    min-width: 360px;
    max-width: 60%;
    margin-bottom: 20px;
  }
  :host([my-comment]) .info .name-and-phone,
  :host([my-comment]) {
    flex-direction: row-reverse;
  }
  :host([my-comment]) .actions {
    flex-direction: row;
  }
  :host([my-comment]) .avatar {
    margin-right: 0px;
    margin-left: 12px;
  }
  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 40px;
    height: 40px;
    margin-right: 12px;
    border-radius: 50%;
    background-color: var(--darker-divider-color);
    color: #ffffff;
    font-weight: 500;
    font-size: 18px;
    text-transform: uppercase;
  }
  .info {
    width: 100%;
  }
  .info .name-and-phone {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .name {
    font-size: 16px;
    line-height: 24px;
    color: var(--primary-text-color);
    padding-right: 6px;
  }
  :host([my-comment]) .name {
    padding-right: 0px;
    padding-left: 6px;
  }
  .date {
    font-size: 12px;
    line-height: 16px;
    color: var(--secondary-text-color);
  }
  .message {
    font-size: 14px;
    line-height: 20px;
    color: var(--secondary-text-color);
    white-space: pre-line;
  }
  .deleted-message {
    font-size: 14px;
    line-height: 20px;
    color: var(--secondary-text-color);
    font-style: italic;
  }
  .actions {
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    padding-top: 8px;
    border-top: 1px solid var(--light-divider-color);
  }
  .actions div {
    display: flex;
    align-items: center;
    margin-right: 30px;
    font-weight: 500;
    font-size: 13px;
    letter-spacing: 0.038em;
    color: var(--secondary-text-color);
    cursor: pointer;
  }
  .actions div.resolved:hover {
    text-decoration: none;
    cursor: default;
  }
  .actions div:hover {
    text-decoration: underline;
  }
  iron-icon {
    margin-right: 8px;
  }
  .delete {
    width: 15px;
    height: 15px;
    color: var(--primary-shade-of-red);
  }
  iron-icon[icon='refresh'],
  .resolve {
    width: 18px;
    height: 18px;
    color: var(--secondary-text-color);
  }
  *[hidden] {
    display: none !important;
  }
  etools-loading {
    width: 20px;
    margin-right: 8px;
  }
  .retry:hover {
    cursor: pointer;
    text-decoration: underline;
  }
  iron-icon[icon='refresh'] {
    margin-right: 2px;
  }
`;
