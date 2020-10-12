import {LitElement, html, TemplateResult, customElement, CSSResultArray, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {
  ExpectedResult,
  Intervention,
  InterventionActivity,
  InterventionActivityTimeframe,
  InterventionQuarter,
  ResultLinkLowerResult
} from '../../common/models/intervention.types';
import {GenericObject, RootState} from '../../common/models/globals.types';
import {ActivityTime, groupByYear, GroupedActivityTime, serializeTimeFrameData} from '../../utils/timeframes.helper';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {ActivityTimeframesStyles} from './activity-timeframes.styles';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import {get} from 'lodash-es';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';

@customElement('activity-timeframes')
export class ActivityTimeframes extends CommentsMixin(LitElement) {
  static get styles(): CSSResultArray {
    // language=css
    return [gridLayoutStylesLit, ActivityTimeframesStyles];
  }

  @property() intervention: Intervention | null = null;

  protected render(): TemplateResult {
    if (!this.intervention) {
      return html``;
    }

    const timeFrames: GroupedActivityTime[] = this.getTimeFrames();
    const mappedActivities: GenericObject<InterventionActivity[]> = this.getActivities();
    return html`
      <etools-content-panel
        show-expand-btn
        panel-title="Activity Timeframes"
        comment-element="activity-timeframes"
        comment-description="Activity Timeframes"
      >
        ${!timeFrames.length
          ? html`
              <div class="align-items-baseline">
                <p>Activity Timeframes will be available after Start and End Date are selected and saved.</p>
              </div>
            `
          : ''}
        <div class="layout-vertical align-items-center">
          ${timeFrames.map(
            ([year, frames]: GroupedActivityTime, index: number) => html`
              <div class="layout-horizontal align-items-center time-frames">
                <!--      Year title        -->
                <div class="year">${year}</div>

                <div class="frames-grid">
                  ${frames.map(
                    ({name, frameDisplay, id}: ActivityTime, index: number) => html`
                      <!--   Frame data   -->
                      <div class="frame ${index === frames.length - 1 ? 'hide-border' : ''}">
                        <div class="frame-name">${name}</div>
                        <div class="frame-dates">${frameDisplay}</div>
                      </div>

                      <div class="activities-container ${index === frames.length - 1 ? 'hide-border' : ''}">
                        <div class="no-activities" ?hidden="${mappedActivities[id].length}">- No Activities</div>
                        ${mappedActivities[id].map(
                          ({name: activityName}: InterventionActivity) => html`
                            <div class="activity-name">Activity ${activityName}</div>
                          `
                        )}
                      </div>
                    `
                  )}
                </div>
              </div>
              <div class="year-divider" ?hidden="${index === timeFrames.length - 1}"></div>
            `
          )}
        </div>
      </etools-content-panel>
    `;
  }

  stateChanged(state: RootState): void {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'timing')) {
      return;
    }
    this.intervention = state.interventions.current;
    super.stateChanged(state);
  }

  private getTimeFrames(): GroupedActivityTime[] {
    if (!this.intervention) {
      return [];
    }
    // process time frames
    const quarters: InterventionQuarter[] = this.intervention.quarters || [];
    const serialisedFrames: ActivityTime[] = serializeTimeFrameData(quarters as InterventionActivityTimeframe[]);
    return groupByYear(serialisedFrames);
  }

  private getActivities(): GenericObject<InterventionActivity[]> {
    if (!this.intervention) {
      return {};
    }

    // get activities array
    const pdOutputs: ResultLinkLowerResult[] = this.intervention.result_links
      .map(({ll_results}: ExpectedResult) => ll_results)
      .flat();
    const activities: InterventionActivity[] = pdOutputs
      .map(({activities}: ResultLinkLowerResult) => activities)
      .flat();

    // map activities to time frames
    const quarters: InterventionQuarter[] = this.intervention.quarters || [];
    const mappedActivities: GenericObject<InterventionActivity[]> = quarters.reduce(
      (data: GenericObject<InterventionActivity[]>, quarter: InterventionQuarter) => ({
        ...data,
        [quarter.id]: []
      }),
      {}
    );
    activities.forEach((activity: InterventionActivity) => {
      activity.time_frames.forEach((id: number) => {
        mappedActivities[id].push(activity);
      });
    });
    return mappedActivities;
  }
}
