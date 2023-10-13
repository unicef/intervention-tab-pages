import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js';

/**
 * LitElement
 */
@customElement('etools-progress-bar')
export class EtoolsProgressBar extends LitElement {
  // static get is() {
  //   return 'etools-progress-bar';
  // }

  render() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: row;
          align-items: center;
        }

        #progress-percent {
          margin-inline-start: 16px;
          min-width: 56px;
        }

        sl-progress-bar {
          width: var(--etools-progress-bar-width, 200px);
          --height: 10px;
          --indicator-color: var(--primary-color);
        }

        @media print {
          sl-progress-bar {
            position: relative;
          }

          sl-progress-bar::before,
          sl-progress-bar::after {
            content: ' ';
            display: inline-block;
            position: absolute;
            top: 0;
            left: 0;
            height: 0;
          }

          sl-progress-bar::before {
            z-index: 1;
            right: 0;
            border-bottom: 10px solid var(--sl-color-grey-300);
          }

          sl-progress-bar::after {
            z-index: 1;
            border-bottom: 10px solid var(--primary-color);
            width: ${this.progressWidthOnPrint};
          }
        }
      </style>
      <sl-progress-bar .value="${this.progressValue}"></sl-progress-bar>
      <span id="progress-percent">${this._prepareDisplayedValue(this.progressValue)} %</span>
    `;
  }

  @property({type: Number})
  progressValue = 0;

  _value = 0;

  set value(value) {
    this._value = value;
    this.progressValue = this._getProgress(value);
  }

  @property({type: Number})
  get value() {
    return this._value;
  }

  @property({type: Boolean})
  noDecimals = false;

  @property({type: String})
  progressWidthOnPrint = '0%';

  _getProgress(value: any) {
    value = parseFloat(parseFloat(value).toFixed(2));
    if (isNaN(value)) {
      return 0;
    }
    // value = (value > 100) ? 100 : value; // cannot be bigger than 100
    value = value < 0 ? 0 : value; // cannot be less that 0
    this.progressWidthOnPrint = value + '%';
    return value;
  }

  /**
   * Secondary progress is used only to show a delimited at the end of the active progress.
   * It will always be 0 (value = 0 || 100) or value + 1
   * @param {number} value
   * @return {number}
   */
  _getSecondaryProgress(value: number) {
    return value > 0 && value < 100 ? value + 1 : 0;
  }

  _prepareDisplayedValue(value: any) {
    return parseFloat(value).toFixed(this.noDecimals ? 0 : 2);
  }
}
