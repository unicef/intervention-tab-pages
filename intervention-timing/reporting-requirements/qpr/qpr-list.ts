import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '../mixins/reporting-req-past-dates-check';
import '../styles/reporting-requirements-lists-styles';
import ReportingReqPastDatesCheckMixin from '../mixins/reporting-req-past-dates-check';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import {reportingRequirementsListStyles} from '../styles/reporting-requirements-lists-styles';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {isEmptyObject} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';
import {translate} from 'lit-translate';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

/**
 * @polymer
 * @customElement
 * @appliesMixin ReportingRequirementsCommonMixin
 * @appliesMixin ReportingReqPastDatesCheckMixin
 */
@customElement('qpr-list')
export class QprList extends ReportingRequirementsCommonMixin(ReportingReqPastDatesCheckMixin(LitElement)) {
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

      ${this.qprData.map(
        (item: any, index: number) =>
          html`
            <etools-data-table-row no-collapse ?secondary-bg-on-hover="${!this._canEdit(this.editMode)}">
              <div slot="row-data" class="layout-horizontal editable-row">
                <div class="col-data col-1 right-align index-col">${this.getIndex(index, this.qprData.length)}</div>
                <div class="col-data col-3">${this.getDateDisplayValue(item.start_date)}</div>
                <div class="col-data col-3">${this.getDateDisplayValue(item.end_date)}</div>
                <div class="col-data col-3">${this.getDateDisplayValue(item.due_date)}</div>
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
    `;
  }

  @property({type: Array})
  qprData: any = [];

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

  getIndex(index: number, dataItemsLength: number) {
    if (+index + 1 === dataItemsLength) {
      return 'FINAL';
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
