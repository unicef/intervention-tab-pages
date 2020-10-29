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

        etools-content-panel.cancellation-tab .cancellation-title {
          font-weight: 500;
          font-size: 19px;
          text-transform: uppercase;
          margin: 15px 0 26px;
          padding-left: 80px;
        }

        etools-content-panel.cancellation-tab .cancellation-text {
          font-size: 17px;
          white-space: pre-wrap;
          color: var(--primary-text-color);
          padding-left: 80px;
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
          width: 70px !important;
          height: 70px !important;
        }
      </style>
      <etools-content-panel class="cancellation-tab" panel-title="">
        <div slot="panel-btns" class="bookmark">
          <iron-icon icon="bookmark"></iron-icon>
        </div>

        <div class="cancellation-title">Cancellation Note</div>
        <div class="cancellation-text">${this.justification}</div>
      </etools-content-panel>
    `;
  }
}

window.customElements.define('cancel-justification', CancelJustification);
