import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import isEmpty from 'lodash-es/isEmpty';
import {AnyObject, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../utils/intervention-endpoints';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {prettyDate} from '@unicef-polymer/etools-utils/dist/date.util';
import dayjs from 'dayjs';

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
        .monitoring-visits-container {
          position: relative;
        }
        .row.padding-row {
          padding: 16px 24px;
          margin: 0;
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

        <div ?hidden="${this._hideMonitoringVisits(this.monitoringVisits.length, this.tpmActivities.length)}">
          <etools-data-table-header
            id="listHeader"
            label="Showing ${this._getVisitsCount(this.monitoringVisits.length, this.tpmActivities.length)} results"
            no-collapse
            .lowResolutionLayout="${this.lowResolutionLayout}"
          >
            <etools-data-table-column class="col-2" field="reference_number"> Reference # </etools-data-table-column>
            <etools-data-table-column class="col-2" field="primary_traveler"> Traveler </etools-data-table-column>
            <etools-data-table-column class="col-2" field="travel_type"> Travel Type </etools-data-table-column>
            <etools-data-table-column class="col-2" field="date"> End Date </etools-data-table-column>
            <etools-data-table-column class="col-2" field="locations"> Locations </etools-data-table-column>
            <etools-data-table-column class="col-2" field="status"> Status </etools-data-table-column>
          </etools-data-table-header>

          ${this.monitoringVisits.map(
            (visit: AnyObject) => html`
              <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
                <div slot="row-data" class="layout-horizontal">
                  <span class="col-data col-2" data-col-header-label="Reference #">
                    <a
                      class="truncate"
                      .href="/t2f/edit-travel/${visit.trip_id}"
                      title="${visit.reference_number}"
                      target="_blank"
                    >
                      ${visit.reference_number}
                    </a>
                  </span>
                  <span class="col-data col-2" title="${visit.primary_traveler}" data-col-header-label="Traveler">
                    <span class="truncate"> ${visit.primary_traveler} </span>
                  </span>
                  <span class="col-data col-2" title="${visit.travel_type}" data-col-header-label="Travel Type">
                    ${visit.travel_type}
                  </span>
                  <span
                    class="col-data col-2"
                    title="${prettyDate(visit.travel_latest_date)}"
                    data-col-header-label="End Date"
                  >
                    ${prettyDate(visit.travel_latest_date)}
                  </span>
                  <span
                    class="col-data col-2"
                    title="${this.getDisplayValue(visit.locations)}"
                    data-col-header-label="Locations"
                  >
                    ${this.getDisplayValue(visit.locations)}
                  </span>
                  <span class="col-data col-2 capitalize" title="${visit.status}" data-col-header-label="Status">
                    ${visit.status}
                  </span>
                </div>
              </etools-data-table-row>
            `
          )}
          ${this.tpmActivities.map(
            (visit: AnyObject) => html`
              <etools-data-table-row no-collapse>
                <div slot="row-data" class="layout-horizontal">
                  <span class="col-data col-2" data-col-header-label="Reference #">
                    <a
                      class="truncate"
                      .href="/tpm/visits/${visit.tpm_visit}/details"
                      title="${visit.visit_reference}"
                      target="_blank"
                    >
                      ${visit.visit_reference}
                    </a>
                  </span>
                  <span class="col-data col-2" title="${visit.tpm_partner_name}" data-col-header-label="Traveler">
                    <span class="truncate"> ${visit.tpm_partner_name} </span>
                  </span>
                  <span
                    class="col-data col-2"
                    title="${this.getDisplayType(visit.is_pv)}"
                    data-col-header-label="Travel Type"
                  >
                    ${this.getDisplayType(visit.is_pv)}
                  </span>
                  <span class="col-data col-2" title="${prettyDate(visit.date)}" data-col-header-label="End Date">
                    ${prettyDate(visit.date)}
                  </span>
                  <span
                    class="col-data col-2"
                    title="${this.getLocNames(visit.locations_details)}"
                    data-col-header-label="Locations"
                  >
                    ${this.getLocNames(visit.locations_details)}
                  </span>
                  <span class="col-data col-2 capitalize" title="${visit.status}" data-col-header-label="Status">
                    ${visit.status}
                  </span>
                </div>
              </etools-data-table-row>
            `
          )}
        </div>
        <div
          class="row padding-row"
          ?hidden="${!this._hideMonitoringVisits(this.monitoringVisits.length, this.tpmActivities.length)}"
        >
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
  monitoringVisits: AnyObject[] = [];

  @property({type: Array})
  tpmActivities: AnyObject[] = [];

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
    this._partnerIdChanged(partnerId);
  }

  @property({type: String})
  get partnerId() {
    return this._partnerId;
  }

  @property({type: Boolean, reflect: true})
  showTpmVisits = true;

  _interventionIdChanged(intervId: string) {
    if (intervId) {
      this._getT2fVisits(intervId);
    }
  }

  _partnerIdChanged(partnerId: string) {
    if (!partnerId) {
      return;
    }
    this.showTpmVisitsAndIdChanged(partnerId, this.showTpmVisits);
  }

  _getT2fVisits(interventionOrPartnerId: string) {
    if (!interventionOrPartnerId) {
      return;
    }

    this.showLoading = true;
    const monitoringVisitsEndpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(
      interventionEndpoints.monitoringVisits,
      {
        id: interventionOrPartnerId,
        year: dayjs().year()
      }
    );

    sendRequest({
      endpoint: monitoringVisitsEndpoint
    })
      .then((resp: any) => {
        this.monitoringVisits = resp;
        this.showLoading = false;
      })
      .catch((error: any) => {
        this.showLoading = false;
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      });
  }

  _getVisitsCount(t2flength: number, tpmLength: number) {
    return this.showTpmVisits ? t2flength + tpmLength : t2flength;
  }

  getDisplayType(is_pv: boolean) {
    return is_pv ? 'TPM Programmatic' : 'TPM Monitoring';
  }

  _hideMonitoringVisits(t2flength: number, tpmLength: number) {
    let shouldHide = t2flength === 0;
    if (this.showTpmVisits) {
      shouldHide = shouldHide && tpmLength === 0;
    }
    return shouldHide;
  }

  showTpmVisitsAndIdChanged(partnerId: string, showTpmVisits: boolean) {
    if (!showTpmVisits || !partnerId) {
      this.tpmActivities = [];
      return;
    }
    const endpoint = this.interventionId
      ? getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.interventionTPMActivities, {
          year: dayjs().year(),
          interventionId: this.interventionId
        })
      : getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.partnerTPMActivities, {
          year: dayjs().year(),
          partnerId: this.partnerId
        });

    sendRequest({
      endpoint: endpoint
    })
      .then((resp: any) => {
        this.tpmActivities = resp;
        this.showLoading = false;
      })
      .catch((_error: any) => {
        this.showLoading = false;
        EtoolsLogger.error('Error on get TPM visits');
      });
  }

  getLocNames(locations: any) {
    if (isEmpty(locations)) {
      return '-';
    }

    if (locations.length === 1) {
      return locations[0].name;
    }
    return locations.map((a: any) => (a.name ? a.name : '')).join(', ');
  }

  getDisplayValue(value: any, separator?: string, skipSpaces?: boolean) {
    if (typeof value === 'string' && value !== '') {
      return value;
    } else if (Array.isArray(value) && value.length > 0) {
      if (!separator) {
        separator = ', ';
      }
      if (skipSpaces) {
        return value.filter((v) => v !== undefined && v !== '' && v !== null).join(separator);
      }
      return value.join(separator);
    } else if (typeof value === 'number') {
      return value;
    }
    return '-';
  }
}
