import {LitElement, customElement, html, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {elevationStyles} from '../../common/styles/elevation-styles';
import {TimingOverviewData} from './timingOverview.models';
import {selectTimingOverview} from './timingOverview.selectors';
import {getStore} from '../../utils/redux-store-access';
import {connect} from 'pwa-helpers/connect-mixin';
import {formatDateShortMonth} from '../../utils/date-utils';
import {RootState} from '../../common/models/globals.types';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';

/**
 * @customElement
 */
@customElement('timing-overview')
export class TimingOverview extends connect(getStore())(LitElement) {
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
      <style>
        ${sharedStyles} :host {
          display: block;
          margin-bottom: 24px;
        }
        section.table {
          display: flex;
          position: relative;
          justify-content: flex-start;
          padding: 0px 24px;
          flex-wrap: wrap;
        }
        .data-column {
          margin: 14px 0;
          min-width: 150px;
          padding: 0 5px;
          box-sizing: border-box;
          flex: 1;
        }
        .data-column > div {
          display: flex;
          padding-top: 4px;
        }
        .input-label {
          padding-top: 0;
          display: flex;
          align-items: center;
        }
      </style>
      <section class="elevation table" elevation="1">
        <div class="data-column">
          <label class="paper-label">Date Created</label>
          <div class="input-label" ?empty="${!this.timingOverview.created}">
            ${formatDateShortMonth(this.timingOverview.created)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">Date first sent to Partner</label>
          <div class="input-label" ?empty="${!this.timingOverview.date_sent_to_partner}">
            ${formatDateShortMonth(this.timingOverview.date_sent_to_partner)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">Date first draft by Partner</label>
          <div class="input-label" empty></div>
        </div>

        <div class="data-column">
          <label class="paper-label">PRC Submission Date</label>
          <div class="input-label" ?empty="${!this.timingOverview.submission_date_prc}">
            ${formatDateShortMonth(this.timingOverview.submission_date_prc)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">PRC Review Date</label>
          <div class="input-label" ?empty="${!this.timingOverview.review_date_prc}">
            ${formatDateShortMonth(this.timingOverview.review_date_prc)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">Date Partner Signed</label>
          <div class="input-label" ?empty="${!this.timingOverview.signed_by_partner_date}">
            ${formatDateShortMonth(this.timingOverview.signed_by_partner_date)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">Date Unicef Signed</label>
          <div class="input-label" ?empty="${!this.timingOverview.signed_by_unicef_date}">
            ${formatDateShortMonth(this.timingOverview.signed_by_unicef_date)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">Date Last Amended</label>
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
    }
  }
}
