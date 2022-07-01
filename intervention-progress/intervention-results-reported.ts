import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-styles/element-styles/paper-material-styles';

import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import {EtoolsCurrency} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-mixin';

import '@unicef-polymer/etools-modules-common/dist/layout/etools-form-element-wrapper';
import './layout/etools-progress-bar';
import './layout/etools-ram-indicators';
import '../common/layout/status/intervention-report-status';
import './reports/indicator-report-target';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';

import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {RootState} from '../common/types/store.types';

import {logError, logWarn} from '@unicef-polymer/etools-behaviors/etools-logging';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {pmpCustomIcons} from './styles/pmp-icons';
import get from 'lodash-es/get';
import {AnyObject, GenericObject} from '@unicef-polymer/etools-types';

import {translate} from 'lit-translate';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {currentIntervention} from '../common/selectors';
import {TABS} from '../common/constants';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import UtilsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/utils-mixin';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {contentSectionStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/content-section-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {frWarningsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/fr-warnings-styles';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {isEmptyObject} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {
  dateDiff,
  dateIsAfter,
  dateIsBetween,
  datesAreEqual,
  isValidDate
} from '@unicef-polymer/etools-modules-common/dist/utils/date-utils';
import {interventionEndpoints} from '../utils/intervention-endpoints';
declare const dayjs: any;

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsCurrency
 * @appliesMixin CommonMixin
 * @appliesMixin UtilsMixin
 */
/**
 * @customElement
 */
@customElement('intervention-results-reported')
export class InterventionResultsReported extends connectStore(
  UtilsMixin(CommonMixin(EndpointsLitMixin(EtoolsCurrency(LitElement))))
) {
  static get styles() {
    return [contentSectionStylesLit, gridLayoutStylesLit, elevationStyles, frWarningsStyles];
  }
  render() {
    return html`
      ${pmpCustomIcons}
      <style>
        ${sharedStyles}${dataTableStylesLit} #progress-summary etools-progress-bar {
          margin-top: 16px;
        }

        #cash-progress etools-form-element-wrapper {
          width: 140px;
        }

        #cash-progress etools-form-element-wrapper:first-child {
          margin-right: 24px;
        }

        etools-data-table-row::part(edt-list-row-collapse-wrapper) {
          padding: 0;
        }

        .lower-result-status-date {
          margin-left: 4px;
        }

        .indicator-report {
          padding-bottom: 0;
        }

        .indicator-report,
        .progress-details {
          padding-left: 58px;
        }

        .progress-details + .indicator-report {
          border-top: 1px solid var(--list-divider-color);
        }

        .report-progress-bar {
          flex: 1;
          --etools-progress-bar-width: 100%;
        }

        .progress-details {
          justify-content: flex-end;
          padding-top: 0;
        }

        indicator-report-target {
          --indicator-report-target-row: {
            padding-right: 72px;
          }
        }

        etools-ram-indicators {
          border-top: 1px solid var(--list-divider-color);
          border-bottom: 1px solid var(--list-divider-color);
        }

        .row-details-content {
          font-size: 15px;
        }

        @media print {
          .indicator-report {
            display: flex;
            flex-direction: row;
          }

          .indicator-report .col-data {
            max-width: calc(100% - 224px);
            flex: none;
            width: auto;
          }

          .indicator-report .progress-bar {
            min-width: 200px;
          }

          .indicator-report .col-data:first-child {
            margin-right: 24px;
          }

          .target-details {
            display: flex;
            width: auto;
            max-width: none;
            margin-top: 16px;
            flex: 1;
          }

          .progress-details {
            justify-content: flex-start;
          }
        }

        etools-info-tooltip etools-form-element-wrapper {
          width: 100% !important;
        }

        div[elevation] {
          padding: 15px 20px;
          background-color: var(--primary-background-color);
        }
      </style>

      <div id="progress-summary" class="content-section paper-material elevation" elevation="1">
        <div class="row-h">
          <div class="layout-vertical col-4">
            <etools-form-element-wrapper
              label="${translate('PD_DURATION')}"
              .value="${this._getPdDuration(this.progress.start_date, this.progress.end_date)}"
            >
            </etools-form-element-wrapper>
            <etools-progress-bar value="${this.pdProgress}" noDecimals></etools-progress-bar>
          </div>
          <div class="layout-vertical col-5">
            <div class="layout-horizontal" id="cash-progress">
              <etools-info-tooltip
                class="fr-nr-warn col-6"
                custom-icon
                icon-first
                .hideTooltip="${!this.multipleCurrenciesWereUsed(this.progress.disbursement, this.progress)}"
              >
                <etools-form-element-wrapper
                  slot="field"
                  label="${translate('CASH_TRANSFERED')}"
                  .value="${this._getPropertyText(this.progress.disbursement_currency)} ${displayCurrencyAmount(
                    this.progress.disbursement,
                    '0',
                    0
                  )}"
                >
                </etools-form-element-wrapper>
                <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                <span slot="message">${translate('DISBURSEMENT_AMOUNTS')}</span>
              </etools-info-tooltip>

              <etools-form-element-wrapper
                class="col-6"
                label="${translate('UNICEF_CASH')}"
                .value="${this._getPropertyText(this.progress.unicef_budget_cash_currency)}
                        ${displayCurrencyAmount(this.progress.unicef_budget_cash, '0', 0)}"
              >
              </etools-form-element-wrapper>
            </div>

            <etools-progress-bar
              .value="${this._getPropertyText(this.progress.disbursement_percent)}"
              noDecimals
              ?hidden="${this.multipleCurrenciesWereUsed(this.progress.disbursement_percent, this.progress)}"
            >
            </etools-progress-bar>
            ${this.multipleCurrenciesWereUsed(this.progress.disbursement_percent, this.progress)
              ? html`<etools-info-tooltip
                  class="currency-mismatch col-6"
                  custom-icon
                  icon-first
                  .hideTooltip="${!this.multipleCurrenciesWereUsed(this.progress.disbursement_percent, this.progress)}"
                >
                  <span slot="field">${translate('NA_%')}</span>
                  <iron-icon slot="custom-icon" icon="pmp-custom-icons:not-equal"></iron-icon>
                  <span slot="message">${translate('FR_CURRENCY_NOT_MATCH')}</span>
                </etools-info-tooltip>`
              : ``}
          </div>
          <div class="col col-3">
            <etools-form-element-wrapper
              label="${translate('OVERALL_PD_SPD_RATING')}"
              .value="${this._getOverallPdStatusDate(this.latestAcceptedPr)}"
              noPlaceholder
            >
              <intervention-report-status
                status="${this.latestAcceptedPr ? this.latestAcceptedPr.review_overall_status : ''}"
                slot="prefix"
              ></intervention-report-status>
            </etools-form-element-wrapper>
          </div>
        </div>
      </div>

      <etools-content-panel class="content-section" panel-title="${translate('RESULTS_REPORTED_SUBTAB')}">
        <div
          class="row-h"
          ?hidden="${this.progress.details ? !this._emptyList(this.progress.details.cp_outputs) : false}"
        >
          <p>${translate('NO_RESULTS')}</p>
        </div>
        ${(this.progress.details ? this.progress.details.cp_outputs : []).map(
          (item: any) => html`
            <div class="row-v row-second-bg">
              <strong>${translate('CP_OUTPUT')}: ${item.title}</strong>
            </div>

            <!-- RAM indicators display -->
            <etools-ram-indicators
              class="row-h"
              interventionId="${this.interventionId}"
              cpId="${item.external_cp_output_id}"
            ></etools-ram-indicators>

            <div class="row-h" ?hidden="${!this._emptyList(item.ll_outputs)}">
              <p>${translate('NO_PD_OUTPUTS')}</p>
            </div>

            <div class="lower-results-table" ?hidden="${this._emptyList(item.ll_outputs)}">
              <etools-data-table-header id="listHeader" no-title>
                <etools-data-table-column class="col-9">${translate('PD_OUTPUTS')}</etools-data-table-column>
                <etools-data-table-column class="col-3">${translate('CURRENT_PROGRESS')}</etools-data-table-column>
              </etools-data-table-header>

              ${item.ll_outputs.map(
                (lowerResult: any) => html`<etools-data-table-row>
                  <div slot="row-data">
                    <span class="col-data col-9"> ${lowerResult.title} </span>
                    <span class="col-data col-3">
                      <intervention-report-status
                        status="${this._getLowerResultStatus(lowerResult.id)}"
                      ></intervention-report-status>
                      <span class="lower-result-status-date">${this._getLowerResultStatusDate(lowerResult.id)}</span>
                    </span>
                  </div>
                  <div slot="row-data-details">
                    <div class="row-details-content flex-c">
                      <div class="row-h" ?hidden="${this._countIndicatorReports(lowerResult.id)}">
                        ${translate('NO_INDICATORS')}
                      </div>
                      ${this._getIndicatorsReports(lowerResult.id).map(
                        (indicatorReport: any) => html`<div class="row-h indicator-report">
                            <div class="col-data col-9">
                              ${this._ternary(indicatorReport.reportable.blueprint.unit, 'number', '#', '%')}
                              ${indicatorReport.reportable.blueprint.title}
                            </div>
                            <div class="col-data col-3 progress-bar">
                              <etools-progress-bar
                                class="report-progress-bar"
                                value="${this.getProgressPercentage(
                                  indicatorReport.reportable.total_against_target,
                                  indicatorReport.reportable.blueprint.display_type
                                )}"
                              >
                              </etools-progress-bar>
                            </div>
                          </div>
                          <div class="row-h progress-details">
                            <div class="layout-vertical col-5 target-details">
                              <indicator-report-target
                                class="print-inline"
                                .displayType="${indicatorReport.reportable.blueprint.display_type}"
                                .target="${indicatorReport.reportable.target}"
                                .cumulativeProgress="${this._ternary(
                                  indicatorReport.reportable.blueprint.display_type,
                                  'number',
                                  indicatorReport.reportable.achieved.v,
                                  indicatorReport.reportable.achieved.c
                                )}"
                                .achievement="${this._ternary(
                                  indicatorReport.reportable.blueprint.display_type,
                                  'number',
                                  indicatorReport.total.v,
                                  indicatorReport.total.c
                                )}"
                              ></indicator-report-target>
                            </div>
                          </div>`
                      )}
                    </div>
                  </div>
                </etools-data-table-row>`
              )}
            </div>
          `
        )}
      </etools-content-panel>
    `;
  }

  _interventionId!: string;

  set interventionId(interventionId) {
    this._interventionId = interventionId;
    // `prpCountries` and `currentUser` are defined in endpoint mixin
    this._requestProgressData(this._interventionId, this.prpCountries, this.currentUser);
  }

  @property({type: String})
  get interventionId() {
    return this._interventionId;
  }

  @property({type: Number})
  pdProgress!: number | null;

  _progress: GenericObject = {};

  set progress(progress) {
    this._progress = progress;
    this._progressDataObjChanged(this._progress);
    this._setTimeProgress(this.progress.start_date, this.progress.end_date);
    this._computeLatestAcceptedPr(this.progress);
  }

  @property({type: String})
  get progress() {
    return this._progress;
  }

  @property({type: Object})
  latestAcceptedPr!: GenericObject;

  @property({type: Array})
  indicatorReports: GenericObject[] = [];

  @property({type: Object})
  prpCountries!: GenericObject[];

  requestInProgress = false;

  interventionStatus!: string;

  stateChanged(state: RootState) {
    if (
      pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Progress, TABS.ResultsReported) ||
      !state.interventions.current
    ) {
      return;
    }

    const currentInterventionId = get(state, 'app.routeDetails.params.interventionId');
    if (currentInterventionId) {
      this.interventionId = currentInterventionId;
    }
    this.interventionStatus = currentIntervention(state)?.status;
    this.endStateChanged(state);
    setTimeout(() => {
      this._requestProgressData(this.interventionId, this.prpCountries, this.currentUser);
    }, 10);
  }

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
    fireEvent(this, 'tab-content-attached');
  }

  multipleCurrenciesWereUsed(disbursementOrPercent: string, progress: GenericObject<any> | null) {
    if (!progress || disbursementOrPercent === undefined) {
      return false; // hide icon until request data is received
    }
    return Number(disbursementOrPercent) === -1 || disbursementOrPercent === 'N/A';
  }

  _requestProgressData(id: string, prpCountries: any, currentUser: AnyObject) {
    if (
      !id ||
      isEmptyObject(prpCountries) ||
      isEmptyObject(currentUser) ||
      this.requestInProgress ||
      ['draft', 'development'].includes(this.interventionStatus)
    ) {
      return;
    }

    fireEvent(this, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: 'pd-progress'
    });
    this.requestInProgress = true;

    this.fireRequest(interventionEndpoints, 'interventionProgress', {pdId: id})
      .then((response: any) => {
        this.progress = response;
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'pd-progress'
        });
      })
      .catch((error: any) => {
        logError('PD/SPD progress request failed!', 'intervention-results-reported', error);
        parseRequestErrorsAndShowAsToastMsgs(error, this);
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'pd-progress'
        });
      })
      .finally(() => (this.requestInProgress = false));
  }

  _emptyList(dataSet: any) {
    return isEmptyObject(dataSet);
  }

  _computeLatestAcceptedPr(progress: any) {
    this.latestAcceptedPr = progress && progress.latest_accepted_pr ? progress.latest_accepted_pr : null;
  }

  _progressDataObjChanged(progress: any) {
    if (!progress) {
      this.indicatorReports = [];
      return;
    }
    if (!this._emptyList(progress.details.cp_outputs)) {
      progress.details.cp_outputs.forEach((result: any) => {
        if (!this._emptyList(result.ll_outputs)) {
          result.ll_outputs.forEach((lowerResult: any) => {
            this._prepareindicatorReportsData(lowerResult.id, progress.latest_accepted_pr_indicator_reports);
          });
        }
      });
    }
  }

  _getPropertyText(prop: any) {
    return prop ? prop : '';
  }

  _prepareindicatorReportsData(lowerResultId: any, progressIndicatorReports: any) {
    const indicatorReportData = {
      lowerResultId: lowerResultId,
      reports: []
    };
    if (this._emptyList(progressIndicatorReports)) {
      return;
    }
    indicatorReportData.reports = progressIndicatorReports.filter(function (report: any) {
      return report.reportable_object_id === lowerResultId;
    });
    this.indicatorReports.push(indicatorReportData);
  }

  _countIndicatorReports(lowerResultId: any) {
    return (
      !this._emptyList(this.indicatorReports) &&
      !!this.indicatorReports.find(function (indReports: any) {
        return indReports.lowerResultId === lowerResultId;
      })
    );
  }

  _getIndicatorsReports(lowerResultId: any) {
    if (this._emptyList(this.indicatorReports)) {
      return [];
    }
    const indicatorsReports = this.indicatorReports.filter(function (indReports: any) {
      return indReports.lowerResultId === lowerResultId;
    });
    return indicatorsReports.length === 0 ? [] : indicatorsReports[0].reports;
  }

  /**
   * Assuming all indicators reports are already sort by date desc
   */
  _getLatestIndicatorReport(lowerResultId: any) {
    if (!this._emptyList(this.indicatorReports)) {
      const indReports = this.indicatorReports.find(function (indReports: any) {
        return indReports.lowerResultId === lowerResultId;
      });
      if (indReports && indReports.reports[0]) {
        return indReports.reports[0];
      }
    }
    return null;
  }

  _getLowerResultStatus(lowerResultId: any) {
    let status = null;
    const latestIndReport = this._getLatestIndicatorReport(lowerResultId);
    if (latestIndReport) {
      status = latestIndReport.overall_status;
    }
    return status;
  }

  _getLowerResultStatusDate(lowerResultId: any) {
    let resultStatusDateStr = '';
    const latestIndReport = this._getLatestIndicatorReport(lowerResultId);
    if (latestIndReport) {
      resultStatusDateStr = '(' + this._convertToDisplayFormat(latestIndReport.submission_date) + ')';
    }
    return resultStatusDateStr;
  }

  _getPdDuration(start: string, end: string) {
    if (!start && !end) {
      return;
    }
    start = this._convertToDisplayFormat(start) || 'N/A';
    end = this._convertToDisplayFormat(end) || 'N/A';
    return start + ' - ' + end;
  }

  _setTimeProgress(start: string, end: string) {
    if (!start && !end) {
      this.pdProgress = null;
      return;
    }
    const today = new Date();
    const startDt = dayjs(start).toDate();
    const endDt = dayjs(end).toDate();
    try {
      if (dateIsBetween(startDt, endDt, today)) {
        const intervalTotalDays = dateDiff(startDt, endDt);
        const intervalDaysCompleted = dateDiff(startDt, today);
        this.pdProgress = (intervalDaysCompleted * 100) / intervalTotalDays;
        return;
      }
    } catch (err) {
      logWarn('Time progress compute error', 'intervention-results-reported', err);
    }
    // if end date is valid and is past date or today's date, progress should be 100%
    if (isValidDate(endDt) && (dateIsAfter(today, endDt) || datesAreEqual(today, endDt))) {
      this.pdProgress = 100;
      return;
    }
    this.pdProgress = 0;
  }

  _getOverallPdStatusDate(latestAcceptedPr: GenericObject) {
    return latestAcceptedPr && latestAcceptedPr.review_date
      ? '(' + this._convertToDisplayFormat(latestAcceptedPr.review_date) + ')'
      : '';
  }

  _convertToDisplayFormat(strDt: string) {
    return dayjs(strDt).format('D MMM YYYY');
  }

  getProgressPercentage(progress_percentage: number, displayType: string) {
    if (displayType === 'percentage') {
      return progress_percentage;
    }
    return progress_percentage * 100;
  }
}
