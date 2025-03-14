import {LitElement, html, TemplateResult, CSSResultArray, css, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {ActivityTime, groupByYear, serializeTimeFrameData} from '../../../../utils/timeframes.helper';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {InterventionActivityTimeframe} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {callClickOnSpacePushListener} from '@unicef-polymer/etools-utils/dist/accessibility.util';

@customElement('activity-time-frames')
export class ActivityTimeFrames extends LitElement {
  static get styles(): CSSResultArray {
    // language=css
    return [
      layoutStyles,
      css`
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        *[hidden] {
          display: none !important;
        }
        .title {
          font-weight: 500;
          font-size: var(--etools-font-size-16, 16px);
          line-height: 18px;
          color: var(--primary-text-color);
        }
        .description {
          font-size: var(--etools-font-size-12, 12px);
          line-height: 16px;
        }
        .year {
          height: 37px;
        }
        .time-frame {
          align-items: center;
          justify-content: center;
          padding: 5px;
          box-sizing: border-box;
          margin: 5px;
          border-radius: 10px;
        }
        .time-frame.selected {
          background: rgba(185, 215, 195, 0.69);
        }
        .time-frame.editable {
          cursor: pointer !important;
        }
        .frame-divider {
          height: 20px;
          border-inline-start: 1px solid #9e9e9e;
        }
        .year-divider {
          margin: 0 5px;
          height: 50px;
          border-inline-start: 1px solid #9e9e9e;
        }
        label {
          text-align: center;
          width: 100%;
          max-width: inherit;
        }
        label[required] {
          font-size: var(--etools-font-size-12, 12px);
          color: var(--secondary-text-color);
          background: url('./assets/images/required.svg') no-repeat 99% 20%/5px;
          width: auto !important;
          max-width: 100%;
          right: auto;
          padding-inline-end: 15px;
          background-size: 5px;
        }
        .time-frame-container {
          flex-wrap: wrap;
        }
        .light-gray-container {
          background-color: #f9f9f9;
          border-radius: 5px;
          margin: 5px;
        }

        .time-frame:focus:not(:focus-visible) {
          outline: 0;
        }
        .time-frame:focus:not(.focus-visible) {
          outline: 0;
        }
        .time-frame:focus-visible {
          outline: 0;
          box-shadow: 0 0 5px 5px rgba(170, 165, 165, 0.3);
        }
        .time-frame.focus-visible {
          outline: black solid 1px;
        }
      `
    ];
  }

  set quarters(frames: InterventionActivityTimeframe[]) {
    const activityTimes: ActivityTime[] = serializeTimeFrameData(frames);
    this._timeFrames = groupByYear(activityTimes);
  }

  @property() private _timeFrames: [string, ActivityTime[]][] = [];
  @property() selectedTimeFrames: number[] = [];
  @property() readonly: boolean | undefined = false;
  @property({type: Boolean, attribute: 'hide-label', reflect: true}) hideLabel = false;

  protected render(): TemplateResult {
    return html`
      <label class="label layout-horizontal center-align" required ?hidden="${this.hideLabel}">
        ${translate('ACTIVITY_TIMES')}
      </label>
      <div class="layout-horizontal center-align time-frame-container">
        ${!this._timeFrames.length ? html`${translate('ACTIVITY_TIMES_MSG')}` : html``}
        ${this._timeFrames.map(
          ([year, frames]: any) => html`
            <div class="light-gray-container">
              <div class="layout-horizontal center-align title year">${year}</div>
              <div class="layout-horizontal center-align">
                ${frames.map(
                  (frame: ActivityTime, index: number) => html`
                    <div
                      tabindex="${this.readonly ? -1 : 0}"
                      class="time-frame ${this.selectedTimeFrames?.includes(frame.id) ? ' selected' : ''} ${!this
                        .readonly
                        ? ' editable'
                        : ''}"
                      @click="${() => this.toggleFrame(frame.id)}"
                    >
                      <div class="title">${frame.name}</div>
                      <div class="description">${frame.frameDisplay}</div>
                    </div>
                    <div class="frame-divider" ?hidden="${index + 1 === frames.length}"></div>
                  `
                )}
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    this.addEventListener('focus', () => {
      if (!this.readonly) {
        (this.shadowRoot!.querySelector('.time-frame') as HTMLElement)?.focus();
      }
    });

    this.shadowRoot!.querySelectorAll('.time-frame').forEach((el) => {
      callClickOnSpacePushListener(el);
    });

    if (window.applyFocusVisiblePolyfill != null) {
      window.applyFocusVisiblePolyfill(this.shadowRoot);
    }
  }

  toggleFrame(frameId: number): void {
    if (this.readonly) {
      return;
    }
    const exists: boolean = this.selectedTimeFrames.includes(frameId);
    if (exists) {
      fireEvent(
        this,
        'time-frames-changed',
        this.selectedTimeFrames.filter((id: number) => id !== frameId)
      );
    } else {
      fireEvent(this, 'time-frames-changed', [...this.selectedTimeFrames, frameId]);
    }
  }

  validate() {
    return !this._timeFrames.length || Boolean(this.selectedTimeFrames.length);
  }
}
