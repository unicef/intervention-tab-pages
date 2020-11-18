import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-data-table/etools-data-table.js';

import '../../../common/layout/icons-actions';
import '../mixins/reporting-req-past-dates-check';
import '../styles/reporting-requirements-lists-styles';
import CommonMixin from '../../../common/mixins/common-mixin';
import ReportingReqPastDatesCheckMixin from '../mixins/reporting-req-past-dates-check';
import {gridLayoutStylesLit} from '../../../common/styles/grid-layout-styles-lit';
import {reportingRequirementsListStylesLit} from '../styles/reporting-requirements-lists-styles';
import {fireEvent} from '../../../utils/fire-custom-event';
// import {IconsActionsEl} from '../../../common/layout/icons-actions';
import {isEmptyObject} from '../../../utils/utils';
import {sharedStyles} from '../../../common/styles/shared-styles-lit';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin ReportingReqPastDatesCheckMixin
 */
@customElement('qpr-list')
export class QprList extends CommonMixin(ReportingReqPastDatesCheckMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    if (!this.qprData.reporting_requirements) {
      return;
    }
    return html`
      <style include="data-table-styles">
        ${sharedStyles}${reportingRequirementsListStylesLit} etools-data-table-row {
          --icons-actions_-_background-color: transparent !important;
        }
        *[slot='row-data'] .col-data {
          display: inline-flex;
          line-height: 24px;
          align-items: center;
        }
      </style>

      <etools-data-table-header no-collapse no-title>
        <etools-data-table-column class="col-1 right-align index-col">ID</etools-data-table-column>
        <etools-data-table-column class="col-3">Start Date</etools-data-table-column>
        <etools-data-table-column class="col-3">End Date</etools-data-table-column>
        <etools-data-table-column class="col-3">Due Date</etools-data-table-column>
        <etools-data-table-column class="flex-c"></etools-data-table-column>
      </etools-data-table-header>

      ${this.qprData.reporting_requirements.map(
        (item: any, index: number) => html`
          <etools-data-table-row
            no-collapse
            ?secondary-bg-on-hover="${this._canEdit(this.editMode, this.inAmendment, item.due_date, item.id)}"
          >
            <div slot="row-data" style="${this._uneditableStyles(this.inAmendment, item.due_date, item.id)}">
              <span class="col-data col-1 right-align index-col"
                >${this.getIndex(index, this.qprData.reporting_requirements.length)}</span
              >
              <span class="col-data col-3">${this.getDateDisplayValue(item.start_date)}</span>
              <span class="col-data col-3">${this.getDateDisplayValue(item.end_date)}</span>
              <span class="col-data col-3">${this.getDateDisplayValue(item.due_date)}</span>
              <span class="col-data flex-c actions">
                <icons-actions-2
                  ?hidden="${!this._canEdit(this.editMode, this.inAmendment, item.due_date, item.id)}"
                  @edit="${this._editQprReq(index)}"
                  @delete="${this._deleteQprReq(index)}"
                >
                </icons-actions-2>
              </span>
            </div>
          </etools-data-table-row>
        `
      )}
    `;
  }

  @property({type: Array})
  qprData: any = {reporting_requirements: []};

  @property({type: Boolean})
  preventPastDateEdit = false;

  _interventionId!: number;

  set interventionId(interventionId) {
    this._interventionId = interventionId;
    this._sortReportingReq(this._qprData,this._qprData.length);
  }

  @property({type: String})
  get interventionId() {
    return this._interventionId;
  }

  static get observers() {
    return ['_sortReportingReq(qprData, qprData.length)'];
  }

  getIndex(index: number, dataItemsLength: number) {
    console.log('get index');
    console.log(dataItemsLength);
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
