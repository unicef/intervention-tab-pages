/* eslint-disable lit/no-legacy-template-syntax */
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {abortRequestByKey} from '@unicef-polymer/etools-utils/dist/etools-ajax/request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';

import '../common/layout/status/intervention-report-status';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {RootState} from '../common/types/store.types';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import get from 'lodash-es/get';
import {GenericObject, User} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {currentIntervention} from '../common/selectors';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {buildUrlQueryString, cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {isEmptyObject, isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {interventionEndpoints} from '../utils/intervention-endpoints';
import {RouteDetails} from '@unicef-polymer/etools-types/dist/router.types';
import pick from 'lodash-es/pick';
import './reports/final-progress-report';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';

/**
 * @LitElement
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
export class InterventionReports extends connectStore(PaginationMixin(CommonMixin(EndpointsLitMixin(LitElement)))) {
  static get styles() {
    return [layoutStyles, elevationStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit}:host {
          flex: 1;
          flex-basis: 0.000000001px;
          width: 100%;
        }

        .pd-ref,
        .view-report {
          color: var(--primary-color);
          font-weight: 500;
          text-decoration: none;
          outline: inherit;
          text-transform: uppercase;
        }

        .pd-ref {
          text-transform: none;
        }

        .final-badge {
          display: inline-block;
          border-radius: 1px;
          padding: 1px 6px;
          font-size: var(--etools-font-size-10, 10px);
          text-transform: uppercase;
          background-color: var(--sl-color-gray-200);
          margin-inline-start: 5px;
          font-weight: bold;
        }

        .tooltip-trigger {
          position: relative;
        }
        .pad-bottom {
          padding-bottom: 25px;
        }
        .rdc-title.col-12 {
          padding: 0;
        }
      </style>
      <etools-media-query
        query="(max-width: 767px)"
        @query-matches-changed="${this.resolutionChanged}"
      ></etools-media-query>
      <etools-content-panel panel-title="${translate('REPORTS')}" class="pad-bottom">
        ${!this.reports.length
          ? html` <div class="row-h">
              <p>${translate('NO_REPORTS_YET')}</p>
            </div>`
          : html` <etools-data-table-header
                id="listHeader"
                .lowResolutionLayout="${this.lowResolutionLayout}"
                label="${this.paginator.visible_range[0]}-${this.paginator.visible_range[1]} of ${this.paginator
                  .count} results to show"
              >
                <etools-data-table-column class="col-2">${translate('REPORT_NUM')}</etools-data-table-column>
                <etools-data-table-column class="col-4">${translate('PARTNER')}</etools-data-table-column>
                <etools-data-table-column class="col-2">${translate('REPORT_STATUS')}</etools-data-table-column>
                <etools-data-table-column class="col-2">${translate('DUE_DATE')}</etools-data-table-column>
                <etools-data-table-column class="col-2">${translate('REPORTING_PERIOD')}</etools-data-table-column>
              </etools-data-table-header>
              ${this.reports.map(
                (report: any) => html` <etools-data-table-row .lowResolutionLayout="${this.lowResolutionLayout}">
                  <div slot="row-data">
                    <span class="col-data col-2" data-col-header-label="${translate('REPORT_NUM')}">
                      <sl-tooltip placement="right" content="${report.programme_document.title}">
                        <span id="tooltip-trigger-${report.id}" class="tooltip-trigger">
                          <a
                            class="view-report"
                            href="reports/${report.id}/progress"
                            ?hidden="${!this._canViewReport(report.status)}"
                          >
                            ${this._getReportTitle(report)}
                          </a>
                          <span ?hidden="${this._canViewReport(report.status)}">${this._getReportTitle(report)}</span>
                          ${report.is_final ? html`<span class="final-badge">${translate('FINAL')}</span>` : html``}
                        </span>
                      </sl-tooltip>
                    </span>
                    <span class="col-data col-4" data-col-header-label="${translate('PARTNER')}">
                      <sl-tooltip placement="right" content="${report.partner_vendor_number}">
                        <span id="tooltip-partner-${report.id}" class="tooltip-trigger">
                          ${this._displayOrDefault(report.partner_name)}
                        </span>
                      </sl-tooltip>
                    </span>
                    <span class="col-data col-2" data-col-header-label="${translate('REPORT_STATUS')}">
                      <intervention-report-status status="${report.status}"></intervention-report-status>
                    </span>
                    <span class="col-data col-2" data-col-header-label="${translate('DUE_DATE')}">
                      ${this._displayOrDefault(report.due_date)}
                    </span>
                    <span class="col-data col-2" data-col-header-label="${translate('REPORTING_PERIOD')}">
                      ${this.getDisplayValue(report.reporting_period)}
                    </span>
                  </div>

                  <div slot="row-data-details">
                    <div class="row-details-content">
                      <span class="rdc-title col-12">${translate('UNICEF_FOCAL_POINTS')}</span>
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
      </etools-content-panel>
      <final-progress-report></final-progress-report>
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
  waitQueryParamsInit!: boolean;

  @property({type: String})
  _endpointName = 'reports';

  @property({type: Object})
  _lastParamsUsed!: GenericObject<any>;

  @property({type: Boolean})
  lowResolutionLayout = false;

  @property({type: Object})
  prevQueryStringObj: GenericObject = {size: 10, page: 1};

  @property({type: Object})
  routeDetails!: RouteDetails | null;

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
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'reports')) {
      return;
    }

    this.interventionId = get(state, 'app.routeDetails.params.interventionId') as unknown as number;
    this.endStateChanged(state);

    this.interventionStatus = currentIntervention(state)?.status;

    const stateRouteDetails = get(state, 'app.routeDetails');
    if (this.filteringParamsHaveChanged(stateRouteDetails)) {
      this.routeDetails = cloneDeep(stateRouteDetails);
      this.initializePaginatorFromUrl(this.routeDetails?.queryParams);

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
  }

  filteringParamsHaveChanged(stateRouteDetails: any) {
    return JSON.stringify(stateRouteDetails) !== JSON.stringify(this.routeDetails);
  }

  /**
   *  On first page access/page refresh
   */
  initializePaginatorFromUrl(queryParams: any) {
    if (queryParams.page) {
      this.paginator.page = Number(queryParams.page);
    } else {
      this.paginator.page = 1;
    }

    if (queryParams.size) {
      this.paginator.page_size = Number(queryParams.size);
    }
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

    if (isJsonStrMatch(this._lastParamsUsed, params) || !params.programme_document_ext) {
      return;
    }

    this._lastParamsUsed = Object.assign({}, params);

    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'reports-list'
    });

    // abort previous req and then fire a new one with updated params
    abortRequestByKey(this._endpointName);

    this.fireRequest(interventionEndpoints, 'reports', {}, {params: params}, this._endpointName)
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
        EtoolsLogger.error('Reports list data request failed!', 'reports-list', error);

        parseRequestErrorsAndShowAsToastMsgs(error, this as any);
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'reports-list'
        });
      });
  }

  paginatorChanged() {
    this.updateCurrentParams({page: this.paginator.page, size: this.paginator.page_size});
  }

  private updateCurrentParams(paramsToUpdate: GenericObject<any>, reset = false): void {
    let currentParams = this.routeDetails ? this.routeDetails.queryParams : this.prevQueryStringObj;
    if (reset) {
      currentParams = pick(currentParams, ['sort', 'size', 'page']);
    }
    this.prevQueryStringObj = cloneDeep({...currentParams, ...paramsToUpdate});

    const stringParams: string = buildUrlQueryString(this.prevQueryStringObj);

    history.pushState(window.history.state, '', `interventions/${this.interventionId}/reports?${stringParams}`);
    window.dispatchEvent(new CustomEvent('popstate'));
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
          rows[i]['detailsOpened'] = false;
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
