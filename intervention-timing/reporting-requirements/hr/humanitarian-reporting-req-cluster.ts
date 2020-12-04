import {LitElement, html, property, customElement} from 'lit-element';
import {uniqBy} from 'lodash-es';
import '@unicef-polymer/etools-data-table/etools-data-table';
import EndpointsLitMixin from '../../../common/mixins/endpoints-mixin-lit';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import {gridLayoutStylesLit} from '../../../common/styles/grid-layout-styles-lit';
import {isEmptyObject} from '../../../utils/utils';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {ExpectedResult, ResultLinkLowerResult} from '@unicef-polymer/etools-types';
import {fireEvent} from '../../../utils/fire-custom-event';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';

/**
 * @customElement
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixinLit
 * @appliesMixin ReportingRequirementsCommonMixin
 */

@customElement('humanitarian-reporting-req-cluster')
export class HumanitarianReportingReqCluster extends EndpointsLitMixin(ReportingRequirementsCommonMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
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
          <etools-data-table-column class="col-2">Frequency</etools-data-table-column>
          <etools-data-table-column class="flex-c">Due Dates</etools-data-table-column>
        </etools-data-table-header>
        ${this.reportingRequirements.map(
          (item: any) => html` <etools-data-table-row no-collapse>
            <div slot="row-data">
              <span class="col-data col-2">${this.getFrequencyForDisplay(item.frequency)}</span>
              <span class="col-data flex-c">${this.getDatesForDisplay(item.cs_dates)}</span>
            </div>
          </etools-data-table-row>`
        )}
        </div>

        <div class="row-h" ?hidden="${!this._empty(this.reportingRequirements)}">
          There are no cluster humanitarian report requirements set.
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
        logError('Failed to get hr cluster requirements from API!', 'humanitarian-reporting-req-cluster', error);
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

    return uniqBy(clusterIndicIds, 'id');
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
