/* eslint-disable lit/no-legacy-template-syntax */
import {PolymerElement, html} from '@polymer/polymer';
import '@unicef-polymer/etools-data-table/etools-data-table';
import CommonMixin from '../../../common/mixins/common-mixin';
import EndpointsMixin from '../../../common/mixins/endpoints-mixin';
import {gridLayoutStylesPolymer} from '../../../common/styles/grid-layout-styles-polymer';
import {property} from '@polymer/decorators';
import {isEmptyObject} from '../../../utils/utils';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {ExpectedResult, ResultLinkLowerResult} from '@unicef-polymer/etools-types';

/**
 * @customElement
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin CommonMixin
 */
class HumanitarianReportingReqCluster extends CommonMixin(EndpointsMixin(PolymerElement)) {
  static get template() {
    return html`
      ${gridLayoutStylesPolymer()}
      <style include="data-table-styles">
        :host {
          display: block;
        }

        [hidden] {
          display: none !important;
        }
      </style>

      <div class="flex-c" hidden$="[[!reportingRequirements.length]]">
        <etools-data-table-header no-collapse no-title class="w100">
          <etools-data-table-column class="col-2">Frequency</etools-data-table-column>
          <etools-data-table-column class="flex-c">Due Dates</etools-data-table-column>
        </etools-data-table-header>
        <template is="dom-repeat" items="{{reportingRequirements}}">
          <etools-data-table-row no-collapse>
            <div slot="row-data">
              <span class="col-data col-2">[[getFrequencyForDisplay(item.frequency)]]</span>
              <span class="col-data flex-c">[[getDatesForDisplay(item.cs_dates)]]</span>
            </div>
          </etools-data-table-row>
        </template>
      </div>

      <div class="row-h" hidden$="[[!_empty(reportingRequirements)]]">
        There are no cluster humanitarian report requirements set.
      </div>
    `;
  }

  @property({
    type: Array,
    observer: HumanitarianReportingReqCluster.prototype.reportingRequirementsChanged
  })
  reportingRequirements!: [];

  @property({
    type: String,
    // @ts-ignore
    observer: HumanitarianReportingReqCluster.prototype.interventionIdChanged
  })
  interventionId!: string;

  @property({type: Number, notify: true})
  requirementsCount = 0;

  @property({type: Array})
  expectedResults!: [];

  ready() {
    super.ready();
  }

  interventionIdChanged(newId: string, _oldId: string) {
    if (!newId) {
      this.reportingRequirements = [];
      return;
    }

    const clusterIndicIds = this._getClusterIndicIds();
    if (isEmptyObject(clusterIndicIds)) {
      this.reportingRequirements = [];
      return;
    }
    // @lajos TO BE CHECKED and refactored
    // NEED HELP HERE: see user-actions.ts
    // BIG TODO
    this.fireRequest(
      'hrClusterReportingRequirements',
      {},
      {
        method: 'POST',
        body: {reportable_ids: clusterIndicIds}
      }
    )
      .then((response: any) => {
        this.set('reportingRequirements', response);
      })
      .catch((error: any) => {
        logError('Failed to get hr cluster requirements from API!', 'humanitarian-reporting-req-cluster', error);
        parseRequestErrorsAndShowAsToastMsgs(error, this);
        this.reportingRequirements = [];
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

    return new Set(clusterIndicIds);
  }

  reportingRequirementsChanged(repReq: any) {
    this.set('requirementsCount', isEmptyObject(repReq) ? 0 : repReq.length);
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

window.customElements.define('humanitarian-reporting-req-cluster', HumanitarianReportingReqCluster);
