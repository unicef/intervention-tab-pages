import {LitElement, TemplateResult, html, css, CSSResultArray, property, customElement} from 'lit-element';
import {InterventionQuarter} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import './time-intervals-dialog';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {translate} from 'lit-translate';
import {formatDate} from '@unicef-polymer/etools-modules-common/dist/utils/date-utils';

@customElement('time-intervals')
export class TimeIntervals extends LitElement {
  @property() quarters: InterventionQuarter[] = [];
  @property() selectedTimeFrames: number[] = [];
  @property({type: Boolean, reflect: true, attribute: true}) readonly: boolean | undefined = false;
  @property({type: Boolean, reflect: true, attribute: 'without-popup'}) withoutPopup: boolean | undefined = false;
  @property({type: Boolean})
  invalid = false;

  protected render(): TemplateResult | TemplateResult[] {
    return this.quarters.length
      ? html` <style>
            :host([without-popup]) {
              cursor: text;
            }
            paper-tooltip[theme='light'] {
              --paper-tooltip-background: var(--primary-background-color, #ffffff);
              --paper-tooltip-opacity: 1;
              --paper-tooltip-text-color: var(--primary-text-color, rgba(0, 0, 0, 0.87));

              --paper-tooltip: {
                text-align: center;
                line-height: 1.4;
                -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
                -moz-box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
                border: 1px solid rgba(0, 0, 0, 0.15);
                font-size: 12px;
                white-space: nowrap;
              }
            }
          </style>
          ${this.quarters.map(
            (quarter: InterventionQuarter) =>
              html`
                <div id="quarter_${quarter.id}" class="quarter ${this.isSelected(quarter) ? 'selected' : ''}">
                  ${quarter.name}
                </div>
                <paper-tooltip for="quarter_${quarter.id}" position="top" theme="light" animation-delay="0" offset="4">
                  <strong>${quarter.name}:</strong>
                  ${formatDate(quarter.start, 'DD MMM')} - ${formatDate(quarter.end, 'DD MMM')}
                  ${formatDate(quarter.start, 'YYYY')}
                </paper-tooltip>
              `
          )}
          <div ?hidden="${!this.invalid}" class="invalid">${translate('PLS_SELECT_TIME_PERIODS')}</div>`
      : html`
          <etools-info-tooltip class="" icon-first custom-icon>
            <iron-icon icon="info" slot="custom-icon"></iron-icon>
            <div slot="message">${translate('ACTIVITY_TIMES_MSG')}</div>
          </etools-info-tooltip>
        `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', () => this.openDialog());
  }

  openDialog(): void {
    if (!this.quarters.length || this.withoutPopup) {
      return;
    }
    openDialog<any>({
      dialog: 'time-intervals-dialog',
      dialogData: {
        selectedTimeFrames: this.selectedTimeFrames,
        quarters: this.quarters,
        readonly: this.readonly
      }
    }).then(({confirmed, response}) => {
      if (confirmed) {
        if (response && response.length) {
          this.invalid = false;
        }
        fireEvent(this, 'intervals-changed', response);
      }
    });
  }

  private isSelected(quater: InterventionQuarter): boolean {
    return this.selectedTimeFrames.includes(quater.id);
  }

  static get styles(): CSSResultArray {
    // language=css
    return [
      css`
        :host {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          cursor: pointer;
          place-content: flex-start;
          max-width: 92px;
        }
        .quarter {
          height: 20px;
          width: 20px;
          padding: 0 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          background-color: #a3a3a3;
          font-family: Roboto;
          font-size: 12px;
          font-weight: 500;
          color: #ffffff;
          box-sizing: border-box;
        }
        .quarter.selected {
          background-color: #558a5b;
        }
        .invalid {
          color: var(--error-color);
          padding: 4px 0;
          font-size: 12px;
        }
        iron-icon {
          color: var(--primary-color);
        }
      `
    ];
  }
}
