import {LitElement, html, property, customElement} from 'lit-element';
import {fireEvent} from '../../../utils/fire-custom-event';
import CONSTANTS from '../../../common/constants';
import '@polymer/paper-button/paper-button.js';
import './edit-hru-dialog.js';
import './hru-list.js';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import FrontendPaginationMixin from '../mixins/frontend-pagination-mixin';
import {gridLayoutStylesLit} from '../../../common/styles/grid-layout-styles-lit';
import {HruListEl} from './hru-list.js';
import {ExpectedResult} from '@unicef-polymer/etools-types';
import {buttonsStyles} from '../../../common/styles/button-styles';
import {translate, get as getTranslation} from 'lit-translate';
import {openDialog} from '../../../utils/dialog';
import {sharedStyles} from '../../../common/styles/shared-styles-lit';

/**
 * @customElement
 * @polymer
 * @mixinFunction
 * @appliesMixin ReportingRequirementsCommonMixin
 * @appliesMixin FrontendPaginationMixin
 */
@customElement('humanitarian-reporting-req-unicef')
export class HumanitarianReportingReqUnicef extends FrontendPaginationMixin(
  ReportingRequirementsCommonMixin(LitElement)
) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    if (this.reportingRequirements.length) {
      this._paginationChanged(this.pagination.pageNumber, this.pagination.pageSize, this.reportingRequirements);
    }
    return html`
      <style>
        ${sharedStyles}:host {
          display: block;
        }
        *[hidden] {
          display: none !important;
        }
      </style>

      <div ?hidden="${!this._empty(this.reportingRequirements)}">
        <div class="row-h">
          ${translate('INTERVENTION_TIMING.PARTNER_REPORTING_REQUIREMENTS.NO_HUMANITARIAN_REPORT')}
        </div>
        <div class="row-h" ?hidden="${!this._showAdd(this.expectedResults, this.editMode)}">
          <paper-button class="secondary-btn" @click="${this.openUnicefHumanitarianRepReqDialog}">
            ${translate('INTERVENTION_TIMING.PARTNER_REPORTING_REQUIREMENTS.ADD_REQUIREMENTS')}
          </paper-button>
        </div>
        <div class="row-h" ?hidden="${this._thereAreHFIndicators(this.expectedResults)}">
          ${translate('INTERVENTION_TIMING.PARTNER_REPORTING_REQUIREMENTS.CAN_BE_MODIFIED_PROMPT')}
        </div>
      </div>

      <div class="flex-c" ?hidden="${this._empty(this.reportingRequirements)}">
        <hru-list id="hruList" .hruData="${this.dataItems}" disable-sorting use-pagination-index> </hru-list>
        <etools-data-table-footer
          .pageSize="${this.pagination.pageSize}"
          .pageNumberr="${this.pagination.pageNumber}"
          .totalResults="${this.pagination.totalResults}"
          @page-size-changed="${this._pageSizeChanged}"
          @page-number-changed="${this._pageNumberChanged}"
        >
        </etools-data-table-footer>
      </div>
    `;
  }

  @property({type: Array})
  expectedResults!: [];

  @property({type: Date})
  interventionStart!: Date;

  @property({type: Boolean})
  editMode!: boolean;

  connectedCallback() {
    super.connectedCallback();
    if (this.reportingRequirements) {
      this._paginationChanged(1, 10, this.reportingRequirements);
    }
    const hruListEl = this.shadowRoot!.querySelector('hruList') as HruListEl;
    if (hruListEl) {
      hruListEl.hruMainEl = this;
    }
  }

  _reportingRequirementsSaved(reportingRequirements: any[]) {
    this._onReportingRequirementsSaved(reportingRequirements);
    this.pagination.pageNumber = 1;
  }

  _sortRequirementsAsc() {
    this.reportingRequirements.sort((a: string, b: string) => {
      // @ts-ignore
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }

  _getReportType() {
    return CONSTANTS.REQUIREMENTS_REPORT_TYPE.HR;
  }

  openUnicefHumanitarianRepReqDialog() {
    if (!this.interventionStart) {
      fireEvent(this, 'toast', {
        text: getTranslation('INTERVENTION_TIMING.PARTNER_REPORTING_REQUIREMENTS.FILL_START_DATE'),
        showCloseBtn: true
      });
      return;
    }
    let hruData = [];
    if (this.requirementsCount > 0) {
      hruData = JSON.parse(JSON.stringify(this.reportingRequirements));
    }
    openDialog({
      dialog: 'edit-hru-dialog',
      dialogData: {
        hruData: hruData,
        selectedDate: '',
        interventionId: this.interventionId,
        interventionStart: this.interventionStart
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return;
      }
      this._reportingRequirementsSaved(response);
    });
  }

  setTotalResults(interventionId: number, reportingRequirements: any) {
    if (typeof interventionId === 'undefined' || typeof reportingRequirements === 'undefined') {
      return;
    }
    this.pagination.totalResults = reportingRequirements.length;
  }

  _getIndex(index: number) {
    return index + 1 + this.pagination.pageSize * (this.pagination.pageNumber - 1);
  }

  _thereAreHFIndicators(expectedResults: ExpectedResult[]) {
    if (!expectedResults) {
      return false;
    }
    const hfIndicator = expectedResults.find((r: any) => {
      return r.ll_results.find((llr: any) => {
        return llr.applied_indicators.find((i: any) => {
          return i.is_active && i.is_high_frequency;
        });
      });
    });
    return hfIndicator ? true : false;
  }

  _showAdd(expectedResults: ExpectedResult[], editMode: boolean) {
    if (!editMode) {
      return false;
    }
    return this._thereAreHFIndicators(expectedResults);
  }
}

export {HumanitarianReportingReqUnicef as HumanitarianReportingReqUnicefEl};
