import {LitElement, html, TemplateResult, CSSResultArray, css, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../common/styles/grid-layout-styles-lit';
import {InterventionActivityTimeframe} from '../../../../common/models/intervention.types';
import {
  ActivityTime,
  convertActivityTimeToData,
  groupByYear,
  serializeTimeFrameData
} from '../../../../utils/timeframes.helper';
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
        .text {
          font-size: 12px;
          line-height: 16px;
          color: var(--secondary-text-color);
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
          height: 37px;
        }
        .time-frame {
          display: flex;
          flex-direction: column;
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
      `
    ];
  }

  set timeFrames(frames: InterventionActivityTimeframe[]) {
    const activityTimes: ActivityTime[] = serializeTimeFrameData(frames);
    this._timeFrames = groupByYear(activityTimes);
  }

  @property() private _timeFrames: [string, ActivityTime[]][] = [];

  protected render(): TemplateResult {
    return html`
      <div class="text">Activity Times (click to select/deselect)</div>
      <div class="layout-horizontal center-align">
        ${this._timeFrames.map(
          ([year, frames]: any, index: number) => html`
            <div>
              <div class="layout-horizontal center-align title year">${year}</div>
              <div class="layout-horizontal center-align">
                ${frames.map(
                  (frame: ActivityTime, index: number) => html`
                    <div
                      class="time-frame${frame.enabled ? ' selected' : ''}"
                      @click="${() => this.toggleFrame(frame)}"
                    >
                      <div class="title">${frame.name}</div>
                      <div class="description">${frame.frameDisplay}</div>
                    </div>
                    <div class="frame-divider" ?hidden="${index + 1 === frames.length}"></div>
                  `
                )}
              </div>
            </div>
            <div class="year-divider" ?hidden="${index + 1 === this._timeFrames.length}"></div>
          `
        )}
      </div>
    `;
  }

  toggleFrame(frame: ActivityTime): void {
    frame.enabled = !frame.enabled;
    const timeFrames: ActivityTime[] = this._timeFrames.map((frame: [string, ActivityTime[]]) => frame[1]).flat();
    const converted: InterventionActivityTimeframe[] = convertActivityTimeToData(timeFrames);
    fireEvent(this, 'time-frames-changed', converted);
  }
}
