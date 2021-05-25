import {html} from 'lit-element';
import {sharedStyles} from './shared-styles-lit';

export const InfoElementStyles = html`
  <style>
    ${sharedStyles} :host {
      display: block;
      margin-bottom: 24px;
    }
    section.table {
      display: flex;
      position: relative;
      justify-content: flex-start;
      padding: 0 24px;
      flex-wrap: wrap;
    }
    .data-column {
      margin: 14px 0;
      min-width: 140px;
      max-width: max-content;
      padding: 0 5px;
      box-sizing: border-box;
    }
    .data-column > div {
      display: flex;
      padding-top: 4px;
    }
    .input-label {
      padding-top: 0;
      display: flex;
      align-items: center;
    }
  </style>
`;
