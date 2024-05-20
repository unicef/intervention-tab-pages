import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {ExpectedResult, ResultLinkLowerResult} from '@unicef-polymer/etools-types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {translate} from 'lit-translate';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';

/**
 * @customElement
 * @LitElement
 * @mixinFunction
 * @appliesMixin EndpointsMixinLit
 * @appliesMixin ReportingRequirementsCommonMixin
 */

@customElement('humanitarian-reporting-req-cluster')
export class HumanitarianReportingReqCluster extends EndpointsLitMixin(ReportingRequirementsCommonMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`
      <style>
        ${dataTableStylesLit}:host {
          display: block;
        }

        [hidden] {
          display: none !important;
        }
      </style>

      <div class="flex-c" ?hidden="${!this.reportingRequirements.length}">
        <etools-data-table-header no-collapse no-title class="w100">
          <etools-data-table-column class="col-2">${translate('FREQUENCY')}</etools-data-table-column>
          <etools-data-table-column class="col-10">${translate('DUE_DATES')}</etools-data-table-column>
        </etools-data-table-header>
        ${this.reportingRequirements.map(
          (item: any) => html` <etools-data-table-row no-collapse>
            <div slot="row-data">
              <span class="col-data col-2">${this.getFrequencyForDisplay(item.frequency)}</span>
              <span class="col-data col-10">${this.getDatesForDisplay(item.cs_dates)}</span>
            </div>
          </etools-data-table-row>`
        )}
        </div>

        <div class="row-h" ?hidden="${!this._empty(this.reportingRequirements)}">
          ${translate('NO_CLUSTER_HUMANITARIAN_REQUIREMENTS_SET')}
        </div>
      </div>
    `;
  }
  _reportingRequirements!: [];

  set reportingRequirements(reportingRequirements) {
    this._reportingRequirements = reportingRequirements;
    this.reportingRequirementsChanged(this._reportingRequirements);
  }

  @property({type: String})
  get reportingRequirements() {
    return this._reportingRequirements;
  }

  _interventionId!: number;

  set interventionId(interventionId) {
    this._interventionId = interventionId;
    this.interventionIdChanged(this._interventionId);
  }

  @property({type: String})
  get interventionId() {
    return this._interventionId;
  }

  @property({type: Number})
  requirementsCount = 0;

  @property({type: Array})
  expectedResults!: [];

  connectedCallback() {
    super.connectedCallback();
  }

  interventionIdChanged(newId: number) {
    if (!newId) {
      this.reportingRequirements = [];
      return;
    }

    const clusterIndicIds = this._getClusterIndicIds();
    if (isEmptyObject(clusterIndicIds)) {
      this.reportingRequirements = [];
      return;
    }
    let reportingRequirementsOriginal = this.reportingRequirements;
    this.fireRequest(
      interventionEndpoints,
      'hrClusterReportingRequirements',
      {},
      {
        method: 'POST',
        body: {reportable_ids: clusterIndicIds}
      }
    )
      .then((response: any) => {
        reportingRequirementsOriginal = response;
        this.reportingRequirements = [...reportingRequirementsOriginal];
        this.requestUpdate();
      })
      .catch((error: any) => {
        EtoolsLogger.error(
          'Failed to get hr cluster requirements from API!',
          'humanitarian-reporting-req-cluster',
          error
        );
        parseRequestErrorsAndShowAsToastMsgs(error, this);
        reportingRequirementsOriginal = [];
        this.reportingRequirements = [...reportingRequirementsOriginal];
        this.requestUpdate();
      });
  }

  _getClusterIndicIds() {
    if (isEmptyObject(this.expectedResults)) {
      return [];
    }
    const clusterIndicIds: any[] = [];
    this.expectedResults.forEach((r: ExpectedResult) => {
      return r.ll_results.forEach((llr: ResultLinkLowerResult) => {
        return llr.applied_indicators.forEach((i) => {
          if (i.cluster_indicator_id) {
            clusterIndicIds.push(i.cluster_indicator_id);
          }
        });
      });
    });
    return [...new Set(clusterIndicIds)];
  }

  reportingRequirementsChanged(repReq: any) {
    this.requirementsCount = isEmptyObject(repReq) ? 0 : repReq.length;
    fireEvent(this, 'count-changed', {
      count: this.requirementsCount
    });
  }

  getDatesForDisplay(dates: []) {
    if (!dates) {
      return '';
    }
    if (Array.isArray(dates)) {
      if (!dates.length) {
        return '';
      }
      const formatedDates = dates.map((d) => this.getDateDisplayValue(d));
      return formatedDates.join(', ');
    } else {
      return this.getDateDisplayValue(dates);
    }
  }

  getFrequencyForDisplay(shortenFreq: string) {
    switch (shortenFreq) {
      case 'Wee':
        return 'Weekly';
      case 'Mon':
        return 'Monthly';
      case 'Qua':
        return 'Quarterly';
      case 'Csd':
        return 'Custom';
      default:
        return 'Custom';
    }
  }

  _empty(list: []) {
    return isEmptyObject(list);
  }
}
