import {LitElement, html, TemplateResult, CSSResultArray, css, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../common/styles/grid-layout-styles-lit';
import {InterventionActivityTimeframe} from '../../../../common/models/intervention.types';
import {ActivityTime, groupByYear, serializeTimeFrameData} from '../../../../utils/timeframes.helper';
import {fireEvent} from '../../../../utils/fire-custom-event';

@customElement('activity-time-frames')
export class ActivityTimeFrames extends LitElement {
  static get styles(): CSSResultArray {
    // language=css
    return [
      gridLayoutStylesLit,
      css`
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .title {
          font-weight: 500;
          font-size: 16px;
          line-height: 18px;
          color: var(--primary-text-color);
        }
        .description {
          font-size: 12px;
          line-height: 16px;
        }
        .year {
          margin-left: 50%;
          margin-right: 50%;
          height: 37px;
          margin-top: 15px;
          margin-bottom: 15px;
        }
        .time-frame {
          align-items: center;
          justify-content: center;
          padding: 5px;
          box-sizing: border-box;
          margin: 5px;
          height: 42px;
          border-radius: 10px;
          cursor: pointer;
        }
        .time-frame.selected {
          background: rgba(185, 215, 195, 0.69);
        }
        .frame-divider {
          height: 20px;
          border-left: 1px solid #9e9e9e;
        }
        .year-divider {
          margin: 0 5px;
          height: 50px;
          border-left: 1px solid #9e9e9e;
        }
        label[required] {
          font-size: 12px;
          color: var(--secondary-text-color);
          @apply --required-star-style;
          background: url('./images/required.svg') no-repeat 66% 33%/5px;
        }
        label {
          text-align: center;
          width: 100%;
          max-width: inherit;
        }
        .time-frame-container {
          padding: 16px 0;
          flex: 0 0 30.3333%;
          max-width: 30.3333%;
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

  protected render(): TemplateResult {
    return html`
      <label class="paper-label layout-horizontal center-align" required>Activity Times (click to select/deselect)</label>
      <div class="layout-horizontal center-align layout-wrap col-12">
        ${this._timeFrames.map(
          ([year, frames]: any, index: number) => html`
            <div class="layout-horizontal center-align layout-wrap time-frame-container">
              <div class="layout-horizontal center-align title year row-h">${year}</div>
              <div class="layout-horizontal center-align">
                ${frames.map(
                  (frame: ActivityTime, index: number) => html`
                    <div
                      class="time-frame${this.selectedTimeFrames?.includes(frame.id) ? ' selected' : ''}"
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
            <div class="year-divider" ?hidden="${index + 1 === this._timeFrames.length || (index + 1) % 3 === 0}"></div>
          `
        )}
      </div>
    `;
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
