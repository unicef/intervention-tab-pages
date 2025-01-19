import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {AnyObject, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../utils/intervention-endpoints';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {prettyDate} from '@unicef-polymer/etools-utils/dist/date.util';

/**
 * @customElement
 */
@customElement('monitoring-visits-list')
export class MonitoringVisitsList extends LitElement {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`${sharedStyles}
      <style>
        ${dataTableStylesLit} .monitoring-visits-container {
          position: relative;
        }
        .row.padding-row {
          padding: 16px 24px;
          margin: 0;
        }
        .capitalize {
          text-transform: capitalize;
        }
        etools-data-table-row::part(edt-list-row-wrapper) {
          padding-block-start: 4px;
          padding-block-end: 4px;
        }
      </style>
      <etools-media-query
        query="(max-width: 1200px)"
        .queryMatches="${this.lowResolutionLayout}"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <div class="monitoring-visits-container">
        <etools-loading .active="${this.showLoading}"></etools-loading>

        <div ?hidden="${!this.monitoringActivities.length}">
          <etools-data-table-header
            id="listHeader"
            label="${translate('SHOWING_RESULTS', {count: this.monitoringActivities.length})}"
            no-collapse
            .lowResolutionLayout="${this.lowResolutionLayout}"
          >
            <etools-data-table-column class="col-3" field="reference_number"
              >${translate('REFERENCE')}</etools-data-table-column
            >
            <etools-data-table-column class="col-2" field="primary_traveler"
              >${translate('TRAVELER')}</etools-data-table-column
            >
            <etools-data-table-column class="col-2" field="date">${translate('END_DATE')}</etools-data-table-column>
            <etools-data-table-column class="col-3" field="locations"
              >${translate('LOCATIONS')}</etools-data-table-column
            >
            <etools-data-table-column class="col-2" field="status"
              >${translate('GENERAL.STATUS')}</etools-data-table-column
            >
          </etools-data-table-header>

          ${this.monitoringActivities.map(
            (activity: AnyObject) => html`
              <etools-data-table-row .lowResolutionLayout="${this.lowResolutionLayout}" no-collapse>
                <div slot="row-data">
                  <span class="col-data col-3" data-col-header-label="${translate('REFERENCE')}">
                    <a
                      class="truncate"
                      .href="/fm/activities/${activity.id}/details"
                      title="${activity.reference_number}"
                      target="_blank"
                    >
                      ${activity.reference_number}
                    </a>
                  </span>
                  <span
                    class="col-data col-2"
                    title="${this.getTravelerText(activity)}"
                    data-col-header-label="${translate('TRAVELER')}"
                  >
                    <span class="truncate"> ${this.getTravelerText(activity)} </span>
                  </span>
                  <span
                    class="col-data col-2"
                    title="${prettyDate(activity.end_date)}"
                    data-col-header-label="${translate('END_DATE')}"
                  >
                    ${prettyDate(activity.end_date)}
                  </span>
                  <span
                    class="col-data col-3"
                    data-col-header-label="${translate('LOCATIONS')}"
                    title="${this.getLocationsText(activity)}"
                  >
                    ${this.getLocationsText(activity)}
                  </span>
                  <span
                    class="col-data col-2 capitalize"
                    title="${activity.status}"
                    data-col-header-label="${translate('GENERAL.STATUS')}"
                  >
                    ${activity.status}
                  </span>
                </div>
              </etools-data-table-row>
            `
          )}
        </div>
        <div class="row padding-row" ?hidden="${this.monitoringActivities.length}">
          <p>${translate('NO_ACTIVITIES')}</p>
        </div>
      </div>`;
  }

  @property({type: String})
  endpointName!: string;

  @property({type: Boolean})
  initComplete = false;

  @property({type: Boolean})
  showLoading = true;

  @property({type: Array})
  monitoringActivities: AnyObject[] = [];

  @property({type: Boolean})
  lowResolutionLayout = false;
  _interventionId!: string;

  set interventionId(interventionId) {
    this._interventionId = interventionId;
    this._interventionIdChanged(interventionId);
  }

  @property({type: String})
  get interventionId() {
    return this._interventionId;
  }

  _partnerId!: string;

  set partnerId(partnerId) {
    this._partnerId = partnerId;
  }

  @property({type: String})
  get partnerId() {
    return this._partnerId;
  }

  _interventionIdChanged(intervId: string) {
    if (intervId) {
      this._getFMVisits(intervId);
    }
  }

  _getFMVisits(interventionId: string) {
    if (!interventionId) {
      return;
    }

    this.showLoading = true;
    const url =
      getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.fmActivities).url +
      `&interventions__in=${interventionId}`;

    sendRequest({endpoint: {url: url}})
      .then((resp: any) => {
        this.monitoringActivities = resp;
        this.showLoading = false;
      })
      .catch((error: any) => {
        this.showLoading = false;
        parseRequestErrorsAndShowAsToastMsgs(error, this);
        EtoolsLogger.error('Error on get FM activities');
      });
  }

  getLocationsText(activity: any) {
    if (!activity) return '';
    if (activity.location_site) return activity.location_site.name;
    else {
      return activity.location?.name || '';
    }
  }

  getTravelerText(activity: any) {
    let traveler = activity && activity?.visit_lead ? activity.visit_lead.name : '';
    if (traveler && activity.monitor_type === 'tpm') {
      traveler = `[TPM] ${traveler}`;
    }
    return traveler;
  }
}
