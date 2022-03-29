import {LitElement, TemplateResult, html, css, CSSResultArray, property, customElement} from 'lit-element';
import {InterventionQuarter} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import './time-intervals-dialog';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {translate} from 'lit-translate';

@customElement('time-intervals')
export class TimeIntervals extends LitElement {
  @property() quarters: InterventionQuarter[] = [];
  @property() selectedTimeFrames: number[] = [];
  @property({type: Boolean, reflect: true, attribute: true}) readonly: boolean | undefined = false;
  @property({type: Boolean})
  invalid = false;

  protected render(): TemplateResult | TemplateResult[] {
    return this.quarters.length
      ? html`${this.quarters.map(
            (quarter: InterventionQuarter) =>
              html`<div class="quarter ${this.isSelected(quarter) ? 'selected' : ''}">${quarter.name}</div>`
          )}
          <div ?hidden="${!this.invalid}" class="invalid">Pls select Time Periods</div>`
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
    if (!this.quarters.length) {
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
        }
        .quarter {
          height: 29px;
          width: 29px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          background-color: #a3a3a3;
          font-family: Roboto;
          font-size: 16px;
          font-weight: 500;
          line-height: 26px;
          color: #ffffff;
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
