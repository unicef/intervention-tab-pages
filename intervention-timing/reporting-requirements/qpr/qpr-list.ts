import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import '../mixins/reporting-req-past-dates-check';
import '../styles/reporting-requirements-lists-styles';
import ReportingReqPastDatesCheckMixin from '../mixins/reporting-req-past-dates-check';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import {reportingRequirementsListStyles} from '../styles/reporting-requirements-lists-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {translate, get as getTranslation} from 'lit-translate';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import {formatDateLocalized} from '@unicef-polymer/etools-modules-common/dist/utils/language';

/**
 * @polymer
 * @customElement
 * @appliesMixin ReportingRequirementsCommonMixin
 * @appliesMixin ReportingReqPastDatesCheckMixin
 */
@customElement('qpr-list')
export class QprList extends PaginationMixin(
  ReportingRequirementsCommonMixin(ReportingReqPastDatesCheckMixin(LitElement))
) {
  static get styles() {
    return [gridLayoutStylesLit, reportingRequirementsListStyles];
  }
  render() {
    if (!this.qprData) {
      return;
    }
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit}
      </style>

      <etools-data-table-header no-collapse no-title>
        <etools-data-table-column class="col-1 right-align index-col">ID</etools-data-table-column>
        <etools-data-table-column class="col-3">${translate('START_DATE')}</etools-data-table-column>
        <etools-data-table-column class="col-3">${translate('END_DATE')}</etools-data-table-column>
        <etools-data-table-column class="col-3">${translate('DUE_DATE')}</etools-data-table-column>
        <etools-data-table-column class="flex-c"></etools-data-table-column>
      </etools-data-table-header>

      ${(this.paginatedData || []).map(
        (item: any, index: number) =>
          html`
            <etools-data-table-row no-collapse ?secondary-bg-on-hover="${!this._canEdit(this.editMode)}">
              <div slot="row-data" class="layout-horizontal editable-row">
                <div class="col-data col-1 right-align index-col">${this.getIndex(index, this.qprData.length)}</div>
                <div class="col-data col-3">${formatDateLocalized(item.start_date)}</div>
                <div class="col-data col-3">${formatDateLocalized(item.end_date)}</div>
                <div class="col-data col-3">${formatDateLocalized(item.due_date)}</div>
                <div class="col-data flex-c actions">
                  <paper-icon-button
                    icon="icons:create"
                    @click="${() => this._editQprReq(index)}"
                    ?hidden="${!this.editMode}"
                  ></paper-icon-button>
                  <paper-icon-button
                    icon="icons:delete"
                    ?hidden="${!this.editMode}"
                    @click="${() => this._deleteQprReq(index)}"
                  ></paper-icon-button>
                </div>
              </div>
            </etools-data-table-row>
          `
      )}

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
    `;
  }

  @property({type: Array})
  paginatedData!: any[];

  _qprData!: any[];

  set qprData(qprData) {
    this._qprData = qprData;
    this.dataWasLoaded();
  }

  @property({type: Array})
  get qprData() {
    return this._qprData;
  }

  @property({type: Boolean})
  preventPastDateEdit = false;

  _interventionId!: number;

  set interventionId(interventionId) {
    this._interventionId = interventionId;
    this._sortReportingReq(this.qprData);
  }

  @property({type: String})
  get interventionId() {
    return this._interventionId;
  }

  dataWasLoaded() {
    this.paginator = {...this.paginator, page: 1, page_size: 10, count: this.qprData.length};
  }

  _paginate(pageNumber: number, pageSize: number) {
    if (!this.qprData) {
      return;
    }
    this.paginatedData = (this.qprData || []).slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }

  paginatorChanged() {
    this._paginate(this.paginator.page, this.paginator.page_size);
  }

  getIndex(index: number, dataItemsLength: number) {
    if (+index + 1 === dataItemsLength) {
      return getTranslation('QPR_FINAL');
    }
    return +index + 1;
  }

  _sortReportingReq(qprData: any) {
    if (!isEmptyObject(qprData)) {
      this._sortRequirementsAsc();
    }
  }

  _sortRequirementsAsc() {
    this.qprData.sort((a: string, b: string) => {
      // @ts-ignore
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }

  _editQprReq(index: number) {
    fireEvent(this, 'edit-qpr', {
      index: index
    });
  }

  _deleteQprReq(index: number) {
    fireEvent(this, 'delete-qpr', {
      index: index
    });
  }
}

export {QprList as QprListEl};
