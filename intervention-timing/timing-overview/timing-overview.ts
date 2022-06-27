import {LitElement, customElement, html, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {TimingOverviewData} from './timingOverview.models';
import {selectTimingOverview} from './timingOverview.selectors';
import {formatDate} from '@unicef-polymer/etools-modules-common/dist/utils/date-utils';
import {RootState} from '../../common/types/store.types';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import get from 'lodash-es/get';
import {InfoElementStyles} from '@unicef-polymer/etools-modules-common/dist/styles/info-element-styles';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {translate} from 'lit-translate';
import '@unicef-polymer/etools-info-tooltip/info-icon-tooltip';

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
        <etools-loading source="overv" loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      ${sharedStyles}${InfoElementStyles}
      <section class="elevation" elevation="1" comment-element="timing-overview" comment-description="Overview">
        <div class="table not-allowed">
          <div class="data-column">
            <label class="paper-label">${translate('DATE_CREATED')}</label>
            <div class="input-label" ?empty="${!this.timingOverview.created}">
              ${formatDate(this.timingOverview.created)}
            </div>
          </div>

          <div class="data-column">
            <label class="paper-label">${translate('DATE_FIRST_SENT_PARTNER')}</label>
            <div class="input-label" ?empty="${!this.timingOverview.date_sent_to_partner}">
              ${formatDate(this.timingOverview.date_sent_to_partner)}
            </div>
          </div>

          <div class="data-column">
            <label class="paper-label">${translate('DATE_FIRST_DRAFT_PARTNER')}</label>
            <div class="input-label" ?empty="${!this.timingOverview.submission_date}">
              ${formatDate(this.timingOverview.submission_date)}
            </div>
          </div>

          <div class="data-column">
            <label class="paper-label">${translate('PRC_SUBMISSION_DATE')}</label>
            <div class="input-label" ?empty="${!this.timingOverview.submission_date_prc}">
              ${formatDate(this.timingOverview.submission_date_prc)}
            </div>
          </div>

          <div class="data-column">
            <label class="paper-label">${translate('PRC_REVIEW_DATE')}</label>
            <div class="input-label" ?empty="${!this.timingOverview.review_date_prc}">
              ${formatDate(this.timingOverview.review_date_prc)}
            </div>
          </div>

          <div class="data-column">
            <label class="paper-label">${translate('DATE_PARTNER_SIGNED')}</label>
            <div class="input-label" ?empty="${!this.timingOverview.signed_by_partner_date}">
              ${formatDate(this.timingOverview.signed_by_partner_date)}
            </div>
          </div>

          <div class="data-column">
            <label class="paper-label">${translate('DATE_UNICEF_SIGNED')}</label>
            <div class="input-label" ?empty="${!this.timingOverview.signed_by_unicef_date}">
              ${formatDate(this.timingOverview.signed_by_unicef_date)}
            </div>
          </div>

          <div class="data-column">
            <label class="paper-label">${translate('DATE_LAST_AMENDED')}</label>
            <div class="input-label" ?empty="${!this.timingOverview.date_last_amended}">
              ${formatDate(this.timingOverview.date_last_amended)}
            </div>
          </div>

          <div class="data-column">
            <label class="paper-label">${translate('DAYS_SUBMISSION_SIGNED')}</label>
            <div class="input-label" ?empty="${!this.timingOverview.days_from_submission_to_signed}">
              ${this.timingOverview.days_from_submission_to_signed}
            </div>
          </div>

          <div class="data-column">
            <label class="paper-label">${translate('DAYS_REVIEW_SIGNED')}</label>
            <div class="input-label" ?empty="${!this.timingOverview.days_from_review_to_signed}">
              ${this.timingOverview.days_from_review_to_signed}
            </div>
          </div>
        </div>

        <div class="icon-tooltip-div">
          <info-icon-tooltip .tooltipText="${translate('TIMING_TOOLTIP')}" position="left"> </info-icon-tooltip>
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
