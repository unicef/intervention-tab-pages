/* eslint-disable lit/no-legacy-template-syntax */
import {LitElement, customElement, html, property} from 'lit-element';
import '@polymer/paper-styles/element-styles/paper-material-styles';
import '@polymer/paper-tooltip/paper-tooltip';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/iron-media-query/iron-media-query';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {abortRequestByKey} from '@unicef-polymer/etools-ajax/etools-iron-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';

import '../common/layout/status/intervention-report-status';
import {isEmptyObject, isJsonStrMatch} from '../utils/utils';
import {fireEvent} from '../utils/fire-custom-event';
import {RootState} from '../common/types/store.types';
import {gridLayoutStylesLit} from '../common/styles/grid-layout-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';
import {elevationStyles} from '../common/styles/elevation-styles';
import CommonMixin from '../common/mixins/common-mixin';
import EndpointsMixin from '../common/mixins/endpoints-mixin';
import PaginationMixin from '../common/mixins/pagination-mixin';
import {pageIsNotCurrentlyActive} from '../utils/common-methods';
import get from 'lodash-es/get';
import {connectStore} from '../common/mixins/connect-store-mixin';
import {GenericObject, User} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {currentIntervention} from '../common/selectors';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin PaginationMixin
 * @appliesMixin CommonMixin
 * @appliesMixin EndpointsMixin
 */
/**
 * @customElement
 */
@customElement('intervention-reports')
export class InterventionReports extends connectStore(PaginationMixin(CommonMixin(EndpointsMixin(LitElement)))) {
  static get styles() {
    return [gridLayoutStylesLit, elevationStyles];
  }
  render() {
    return html`
      <style>
        ${dataTableStylesLit}:host {
          @apply --layout-flex;
          width: 100%;

          --paper-tooltip: {
            text-align: center;
            line-height: 1.4;
          }
        }

        .pd-ref,
        .view-report {
          @apply --text-btn-style;
        }

        .pd-ref {
          text-transform: none;
        }

        .final-badge {
          display: inline-block;
          border-radius: 1px;
          padding: 1px 6px;
          font-size: 10px;
          text-transform: uppercase;
          background-color: var(--paper-grey-300);
          margin-left: 5px;
          font-weight: bold;
        }

        .tooltip-trigger {
          position: relative;
        }
      </style>
      <iron-media-query
        query="(max-width: 767px)"
        @query-matches-changed="${this.resolutionChanged}"
      ></iron-media-query>
      <div id="list" class="paper-material elevation" elevation="1">
        ${!this.reports.length
          ? html` <div class="row-h">
              <p>${translate('INTERVENTION_REPORTS.NO_REPORTS_YET')}</p>
            </div>`
          : html` <etools-data-table-header
                id="listHeader"
                .lowResolutionLayout="${this.lowResolutionLayout}"
                label="${this.paginator.visible_range[0]}-${this.paginator.visible_range[1]} of ${this.paginator
                  .count} results to show"
              >
                <etools-data-table-column class="col-2"
                  >${translate('INTERVENTION_REPORTS.REPORT_NUM')}</etools-data-table-column
                >
                <etools-data-table-column class="flex-c"
                  >${translate('INTERVENTION_REPORTS.PARTNER')}</etools-data-table-column
                >
                <etools-data-table-column class="flex-c"
                  >${translate('INTERVENTION_REPORTS.REPORT_STATUS')}</etools-data-table-column
                >
                <etools-data-table-column class="flex-c"
                  >${translate('INTERVENTION_REPORTS.DUE_DATE')}</etools-data-table-column
                >
                <etools-data-table-column class="flex-c"
                  >${translate('INTERVENTION_REPORTS.REPORTING_PERIOD')}</etools-data-table-column
                >
                ${!this.noPdSsfaRef
                  ? html`<etools-data-table-column class="col-2"
                      >${translate('INTERVENTION_REPORTS.PD_SPD_REF_NUM')}</etools-data-table-column
                    >`
                  : html``}
              </etools-data-table-header>
              ${this.reports.map(
                (report: any) => html` <etools-data-table-row .lowResolutionLayout="${this.lowResolutionLayout}">
                  <div slot="row-data">
                    <span
                      class="col-data col-2"
                      data-col-header-label="${translate('INTERVENTION_REPORTS.REPORT_NUM')}"
                    >
                      <span id="tooltip-trigger-${report.id}" class="tooltip-trigger">
                        <a
                          class="view-report"
                          href="reports/${report.id}/progress"
                          ?hidden="${!this._canViewReport(report.status)}"
                        >
                          ${this._getReportTitle(report)}
                        </a>
                        <span ?hidden="${this._canViewReport(report.status)}">${this._getReportTitle(report)}</span>
                        ${report.is_final
                          ? html`<span class="final-badge">${translate('INTERVENTION_REPORTS.FINAL')}</span>`
                          : html``}
                      </span>
                      <paper-tooltip for="tooltip-trigger-${report.id}" position="right" fit-to-visible-bounds>
                        ${report.programme_document.title}
                      </paper-tooltip>
                    </span>
                    <span class="col-data flex-c" data-col-header-label="${translate('INTERVENTION_REPORTS.PARTNER')}">
                      <span id="tooltip-partner-${report.id}" class="tooltip-trigger">
                        ${this._displayOrDefault(report.partner_name)}
                      </span>

                      <paper-tooltip for="tooltip-partner-${report.id}" position="right" fit-to-visible-bounds>
                        ${report.partner_vendor_number}
                      </paper-tooltip>
                    </span>
                    <span
                      class="col-data flex-c"
                      data-col-header-label="${translate('INTERVENTION_REPORTS.REPORT_STATUS')}"
                    >
                      <intervention-report-status status="${report.status}"></intervention-report-status>
                    </span>
                    <span class="col-data flex-c" data-col-header-label="${translate('INTERVENTION_REPORTS.DUE_DATE')}">
                      ${this._displayOrDefault(report.due_date)}
                    </span>
                    <span
                      class="col-data flex-c"
                      data-col-header-label="${translate('INTERVENTION_REPORTS.REPORTING_PERIOD')}"
                    >
                      ${this.getDisplayValue(report.reporting_period)}
                    </span>
                    ${!this.noPdSsfaRef
                      ? html`<span
                          class="col-data col-2"
                          data-col-header-label="${translate('INTERVENTION_REPORTS.PD_SPD_REF_NUM')}"
                        >
                          <a
                            class="pd-ref truncate"
                            href="interventions/${report.programme_document.external_id}/details"
                            title="${this.getDisplayValue(report.programme_document.reference_number)}"
                          >
                            ${this.getDisplayValue(report.programme_document.reference_number)}
                          </a>
                        </span>`
                      : html``}
                  </div>

                  <div slot="row-data-details">
                    <div class="row-details-content">
                      <span class="rdc-title flex-c">${translate('INTERVENTION_REPORTS.UNICEF_FOCAL_POINTS')}</span>
                      <span>${this.getDisplayValue(report.unicef_focal_points)}</span>
                    </div>
                  </div>
                </etools-data-table-row>`
              )}

              <etools-data-table-footer
                .lowResolutionLayout="${this.lowResolutionLayout}"
                .pageSize="${this.paginator.page_size}"
                .pageNumber="${this.paginator.page}"
                .totalResults="${this.paginator.count}"
                .visibleRange="${this.paginator.visible_range}"
                @visible-range-changed="${this.visibleRangeChanged}"
                @page-size-changed="${this.pageSizeChanged}"
                @page-number-changed="${this.pageNumberChanged}"
              >
              </etools-data-table-footer>`}
      </div>
    `;
  }

  _interventionId!: number;

  set interventionId(interventionId) {
    this._interventionId = interventionId;
    this._loadReportsData(
      this.prpCountries,
      interventionId,
      this.currentUser,
      this.paginator.page_size,
      this.paginator.page,
      this.queryParams
    );
  }

  @property({type: Number})
  get interventionId() {
    return this._interventionId;
  }

  _queryParams!: GenericObject;

  set queryParams(queryParams) {
    this._queryParams = queryParams;
    this._loadReportsData(
      this.prpCountries,
      this.interventionId,
      this.currentUser,
      this.paginator.page_size,
      this.paginator.page,
      queryParams
    );
  }

  @property({type: Object})
  get queryParams() {
    return this._queryParams;
  }

  @property({type: Array})
  reports: any = [];

  @property({type: Boolean})
  noPdSsfaRef = false;

  @property({type: Boolean})
  waitQueryParamsInit!: boolean;

  @property({type: String})
  _endpointName = 'reports';

  @property({type: Object})
  _lastParamsUsed!: GenericObject<any>;

  @property({type: Boolean})
  lowResolutionLayout = false;

  interventionStatus!: string;

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'reports')) {
      return;
    }
    this.interventionId = get(state, 'app.routeDetails.params.interventionId');
    this.endStateChanged(state);
    this.interventionStatus = currentIntervention(state)?.status;
    setTimeout(() => {
      this._loadReportsData(
        this.prpCountries,
        this.interventionId,
        this.currentUser,
        this.paginator.page_size,
        this.paginator.page,
        this.queryParams
      );
    }, 10);
  }

  _loadReportsData(
    prpCountries: any,
    interventionId: number,
    currentUser: User,
    _pageSize: number,
    _page: number,
    qParamsData: any
  ) {
    if (
      isEmptyObject(currentUser) ||
      this._queryParamsNotInitialized(qParamsData) ||
      isEmptyObject(prpCountries) ||
      !interventionId ||
      ['draft', 'development'].includes(this.interventionStatus)
    ) {
      return;
    }

    const params = this._prepareReqParamsObj(interventionId);

    if (isJsonStrMatch(this._lastParamsUsed, params) || (this.noPdSsfaRef && !params.programme_document_ext)) {
      return;
    }

    this._lastParamsUsed = Object.assign({}, params);

    fireEvent(this, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: 'reports-list'
    });

    // abort previous req and then fire a new one with updated params
    abortRequestByKey(this._endpointName);

    this.fireRequest('reports', {}, {params: params}, this._endpointName)
      .then((response: any) => {
        if (response) {
          this.reports = [...response.results];
          this.updatePaginatorTotalResults(response);
        }
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'reports-list'
        });
      })
      .catch((error: any) => {
        if (error.status === 0) {
          // req aborted
          return;
        }
        logError('Reports list data request failed!', 'reports-list', error);

        parseRequestErrorsAndShowAsToastMsgs(error, this);
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'reports-list'
        });
      });
  }

  _prepareReqParamsObj(interventionId: number) {
    let params: GenericObject<any> = {};
    if (interventionId > 0) {
      params.programme_document_ext = interventionId;
    }
    params = Object.assign({}, params, this._preserveExistingQueryParams(), this.getRequestPaginationParams());
    return params;
  }

  _canViewReport(status: string) {
    return ['Acc', 'Sen', 'Sub'].indexOf(status) > -1;
  }

  _preserveExistingQueryParams() {
    const params: GenericObject<any> = {};
    if (!isEmptyObject(this.queryParams)) {
      Object.keys(this.queryParams).forEach((k: any) => {
        if (
          (this.queryParams[k] instanceof Array && this.queryParams[k].length > 0) ||
          (this.queryParams[k] instanceof Array === false && this.queryParams[k])
        ) {
          params[k] = this.queryParams[k];
        }
      });
    }
    return params;
  }

  _queryParamsNotInitialized(qParamsData: any) {
    return this.waitQueryParamsInit && !qParamsData.value && qParamsData.path === 'queryParams';
  }

  _displayOrDefault(val: any) {
    if (!val) {
      return '-';
    }
    return val;
  }

  _getReportTitle(report: any) {
    return report.report_type + report.report_number;
  }

  resolutionChanged(e: CustomEvent) {
    this.lowResolutionLayout = e.detail.value;
  }

  // TODO: this is the same function from lists common mixin, but we do not need that entire functionality here
  // refactor in near future
  _listDataChanged() {
    const rows = this.shadowRoot!.querySelectorAll('etools-data-table-row') as any; // TODO: etools-data-table typings
    if (rows && rows.length) {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].detailsOpened) {
          rows[i].set('detailsOpened', false);
        }
      }
    }
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
