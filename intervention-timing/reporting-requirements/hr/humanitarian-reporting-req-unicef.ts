import {LitElement, html, property, customElement} from 'lit-element';
import {fireEvent} from '../../../utils/fire-custom-event';
import CONSTANTS from '../../../common/constants';
import '@polymer/paper-button/paper-button.js';
import './edit-hru-dialog.js';
import './hru-list.js';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import FrontendPaginationMixin from '../mixins/frontend-pagination-mixin';
import {gridLayoutStylesLit} from '../../../common/styles/grid-layout-styles-lit';
import {EditHruDialog} from './edit-hru-dialog.js';
import {HruListEl} from './hru-list.js';
import {ExpectedResult} from '@unicef-polymer/etools-types';
import {buttonsStyles} from '../../../common/styles/button-styles';

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
        :host {
          display: block;
        }
        *[hidden] {
          display: none !important;
        }
      </style>

      <div ?hidden="${!this._empty(this.reportingRequirements)}">
        <div class="row-h">There are no humanitarian report requirements set.</div>
        <div class="row-h" ?hidden="${!this._showAdd(this.expectedResults, this.editMode)}">
          <paper-button class="secondary-btn" @click="${this.openUnicefHumanitarianRepReqDialog}">
            ADD REQUIREMENTS
          </paper-button>
        </div>
        <div class="row-h" ?hidden="${this._thereAreHFIndicators(this.expectedResults)}">
          Can be modified only if there are High Frequency Humanitarian Indicators defined.
        </div>
      </div>

      <div class="flex-c" ?hidden="${this._empty(this.reportingRequirements)}">
        <hru-list id="hruList" class="flex-c" .hruData="${this.dataItems}" disable-sorting use-pagination-index>
        </hru-list>
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

  @property({type: Object})
  editHruDialog!: EditHruDialog;

  @property({type: Array})
  expectedResults!: [];

  @property({type: Date})
  interventionStart!: Date;

  @property({type: Boolean})
  editMode!: boolean;

  connectedCallback() {
    super.connectedCallback();
    this._createEditHruDialog();
    if (this.reportingRequirements) {
      this._paginationChanged(1, 10, this.reportingRequirements);
    }
    const hruListEl = this.shadowRoot!.querySelector('hruList') as HruListEl;
    if (hruListEl) {
      hruListEl.hruMainEl = this;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEditHruDialog();
  }

  _createEditHruDialog() {
    if (this.reportingRequirements) {
      this._reportingRequirementsSaved = this._reportingRequirementsSaved.bind(this);
      this.editHruDialog = document.createElement('edit-hru-dialog') as any;
      this.editHruDialog.addEventListener('reporting-requirements-saved', this._reportingRequirementsSaved as any);
      document.querySelector('body')!.appendChild(this.editHruDialog);
    }
  }

  _removeEditHruDialog() {
    if (this.editHruDialog) {
      this.editHruDialog.removeEventListener('reporting-requirements-saved', this._reportingRequirementsSaved as any);
      document.querySelector('body')!.removeChild(this.editHruDialog);
    }
  }

  _reportingRequirementsSaved(e: CustomEvent) {
    this._onReportingRequirementsSaved(e);
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
        text: 'You have to fill PD Start Date first!',
        showCloseBtn: true
      });
      return;
    }
    let hruData = [];
    if (this.requirementsCount > 0) {
      hruData = JSON.parse(JSON.stringify(this.reportingRequirements));
    }
    this.editHruDialog.hruData = hruData;
    this.editHruDialog.selectedDate = '';
    this.editHruDialog.interventionId = this.interventionId;
    this.editHruDialog.interventionStart = this.interventionStart;
    this.editHruDialog.openDialog();
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
