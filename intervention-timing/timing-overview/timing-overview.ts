import {LitElement, customElement, html, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {elevationStyles} from '../../common/styles/elevation-styles';
import {TimingOverviewData} from './timingOverview.models';
import {selectTimingOverview} from './timingOverview.selectors';
import {formatDateShortMonth} from '../../utils/date-utils';
import {RootState} from '../../common/types/store.types';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import {InfoElementStyles} from '../../common/styles/info-element-styles';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {translate} from 'lit-translate';
import {get} from '../../utils/lodash-alternative';

/**
 * @customElement
 */
@customElement('timing-overview')
export class TimingOverview extends CommentsMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, elevationStyles];
  }
  render() {
    // language=HTML
    if (!this.timingOverview) {
      return html` <style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      ${InfoElementStyles}
      <section class="elevation table" elevation="1" comment-element="timing-overview" comment-description="Overview">
        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_TIMING.TIMING_OVERVIEW.DATE_CREATED')}</label>
          <div class="input-label" ?empty="${!this.timingOverview.created}">
            ${formatDateShortMonth(this.timingOverview.created)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_TIMING.TIMING_OVERVIEW.DATE_FIRST_SENT_PARTNER')}</label>
          <div class="input-label" ?empty="${!this.timingOverview.date_sent_to_partner}">
            ${formatDateShortMonth(this.timingOverview.date_sent_to_partner)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label"
            >${translate('INTERVENTION_TIMING.TIMING_OVERVIEW.DATE_FIRST_DRAFT_PARTNER')}</label
          >
          <div class="input-label" ?empty="${!this.timingOverview.submission_date}">
            ${formatDateShortMonth(this.timingOverview.submission_date)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_TIMING.TIMING_OVERVIEW.PRC_SUBMISSION_DATE')}</label>
          <div class="input-label" ?empty="${!this.timingOverview.submission_date_prc}">
            ${formatDateShortMonth(this.timingOverview.submission_date_prc)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_TIMING.TIMING_OVERVIEW.PRC_REVIEW_DATE')}</label>
          <div class="input-label" ?empty="${!this.timingOverview.review_date_prc}">
            ${formatDateShortMonth(this.timingOverview.review_date_prc)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_TIMING.TIMING_OVERVIEW.DATE_PARTNER_SIGNED')}</label>
          <div class="input-label" ?empty="${!this.timingOverview.signed_by_partner_date}">
            ${formatDateShortMonth(this.timingOverview.signed_by_partner_date)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_TIMING.TIMING_OVERVIEW.DATE_UNICEF_SIGNED')}</label>
          <div class="input-label" ?empty="${!this.timingOverview.signed_by_unicef_date}">
            ${formatDateShortMonth(this.timingOverview.signed_by_unicef_date)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_TIMING.TIMING_OVERVIEW.DATE_LAST_AMENDED')}</label>
          <div class="input-label" empty></div>
        </div>
      </section>
    `;
  }

  @property({type: Object})
  timingOverview!: TimingOverviewData;

  connectedCallback() {
    super.connectedCallback();
  }

  public stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'timing')) {
      return;
    }
    if (state.interventions.current) {
      this.timingOverview = selectTimingOverview(state);
      super.stateChanged(state);
    }
  }
}
