import {LitElement, html, property} from 'lit-element';
import {sharedStyles} from '../../styles/shared-styles-lit';

/**
 * @customElement
 */
export class CancelJustification extends LitElement {
  @property() justification!: string;

  render() {
    // language=HTML
    return html`
      <style>
        ${sharedStyles} :host {
          display: block;
          margin-bottom: 24px;
        }

        etools-content-panel::part(ecp-header-title) {
          font-weight: 500;
          text-align: left;
          font-size: 18px;
          margin-left: 80px;
        }

        .cancellation-text {
          font-size: 17px;
          white-space: pre-wrap;
          color: var(--primary-text-color);
          padding: 26px 12px 26px  80px;
        }

        div[slot='panel-btns'].bookmark {
          position: absolute;
          top: 4px;
          right: auto;
          left: 20px;
          color: grey;
          -webkit-transform: scale(0.9, 1.5);
          -moz-transform: scale(0.9, 1.5);
          -ms-transform: scale(0.9, 1.5);
          -o-transform: scale(0.9, 1.5);
          transform: scale(0.9, 1.5);
          opacity: 1;
        }

        div[slot='panel-btns'].bookmark iron-icon {
          width: 60px !important;
          height: 60px !important;
        }
      </style>
      <etools-content-panel class="cancellation-tab" panel-title="Cancellation Note">
        <div slot="panel-btns" class="bookmark">
          <iron-icon icon="bookmark"></iron-icon>
        </div>

        <div class="cancellation-text">${this.justification}</div>
      </etools-content-panel>
    `;
  }
}

window.customElements.define('cancel-justification', CancelJustification);
