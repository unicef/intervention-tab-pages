import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import CONSTANTS from '../../../common/constants';
import './edit-hru-dialog.js';
import './hru-list.js';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import {ExpectedResult} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import cloneDeep from 'lodash-es/cloneDeep';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';

/**
 * @customElement
 * @LitElement
 * @mixinFunction
 * @appliesMixin ReportingRequirementsCommonMixin
 * @appliesMixin PaginationMixin
 */
@customElement('humanitarian-reporting-req-unicef')
export class HumanitarianReportingReqUnicef extends PaginationMixin(ReportingRequirementsCommonMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`
      <style>
        :host {
          display: block;
        }
        *[hidden] {
          display: none !important;
        }
        .mt-12 {
          margin-block-start: 20px;
        }
      </style>
      <div class="mt-12" ?hidden="${!this._empty(this.reportingRequirements)}">
        <div class="col-12">${translate('NO_HUMANITARIAN_REPORT')}</div>
        <div class="col-12" ?hidden="${!this._showAdd(this.expectedResults, this.editMode)}">
          <etools-button
            variant="text"
            class="no-marg no-pad font-14"
            @click="${this.openUnicefHumanitarianRepReqDialog}"
          >
            ${translate('ADD_REQUIREMENTS')}
          </etools-button>
        </div>
        <div class="col-12" ?hidden="${this._thereAreHFIndicators(this.expectedResults)}">
          ${translate('CAN_BE_MODIFIED_PROMPT')}
        </div>
      </div>

      <div class="col-12" ?hidden="${this._empty(this.reportingRequirements)}">
        <hru-list id="hruList" .hruData="${this.paginatedReports}" .paginator="${this.paginator}" disable-sorting>
        </hru-list>

        <etools-data-table-footer
          .pageSize="${this.paginator.page_size}"
          .pageNumber="${this.paginator.page}"
          .totalResults="${this.paginator.count}"
          .visibleRange="${this.paginator.visible_range}"
          @visible-range-changed="${this.visibleRangeChanged}"
          @page-size-changed="${this.pageSizeChanged}"
          @page-number-changed="${this.pageNumberChanged}"
        >
        </etools-data-table-footer>
      </div>
    `;
  }

  @property({type: Array})
  expectedResults!: [];

  @property({type: Array})
  paginatedReports!: any[];

  @property({type: Date})
  interventionStart!: Date;

  @property({type: Boolean})
  editMode!: boolean;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('reporting-requirements-loaded', this.dataWasLoaded as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('reporting-requirements-loaded', this.dataWasLoaded as any);
  }

  dataWasLoaded() {
    this.paginator = {...this.paginator, page: 1, page_size: 10, count: this.reportingRequirements.length};
  }

  _paginate(pageNumber: number, pageSize: number) {
    if (!this.reportingRequirements) {
      return;
    }
    this.paginatedReports = (this.reportingRequirements || []).slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );
  }

  paginatorChanged() {
    this._paginate(this.paginator.page, this.paginator.page_size);
  }

  _reportingRequirementsSaved(reportingRequirements: any[]) {
    this._onReportingRequirementsSaved(reportingRequirements);
    this.paginator = {...this.paginator, page: 1};
    this.updateReportingRequirements(reportingRequirements, CONSTANTS.REQUIREMENTS_REPORT_TYPE.HR);
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
        text: getTranslation('FILL_START_DATE')
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
        hruData: cloneDeep(hruData),
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
