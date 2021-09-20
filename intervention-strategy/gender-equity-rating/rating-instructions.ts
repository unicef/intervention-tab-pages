import {LitElement, html, property, customElement, css} from 'lit-element';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';

@customElement('rating-instructions')
export class AnswerInstructions extends LitElement {
  static get styles() {
    return [
      elevationStyles,
      css`
        #rating-icon {
          color: var(--primary-color);
        }

        .rating-info-content {
          padding: 24px;
        }

        .rating-info {
          display: flex;
          flex-direction: column;
          padding: 6px;
          margin: 10px 0px;
          width: 100%;
          box-sizing: border-box;
        }

        .rating-info.gray-border {
          border: solid 1px var(--secondary-background-color);
        }

        .rating-info span {
          font-size: 14px;
        }

        .rating-info span.primary {
          font-weight: bold;
        }
      `
    ];
  }

  render() {
    // language=HTML
    return html`
      <style>
        paper-tooltip {
          --paper-tooltip-background: #ffffff;
          --paper-tooltip: {
            padding: 0;
          }
          width: 200px;
        }

        paper-tooltip span {
          font-size: 16px;
          color: var(--primary-text-color);
          line-height: 20px;
        }
      </style>

      <paper-icon-button id="rating-icon" icon="info"></paper-icon-button>
      <paper-tooltip for="rating-icon" animation-entry="noanimation" position="right">
        ${this.getRatingInfoHtml()}
      </paper-tooltip>
    `;
  }

  @property({type: String})
  instructions = '';

  getRatingInfoHtml() {
    return html`
      <div class="rating-info-content elevation" elevation="1">
        <div class="rating-info gray-border">
          <span class="primary">${this.instructions}</span>
        </div>
      </div>
    `;
  }
}
