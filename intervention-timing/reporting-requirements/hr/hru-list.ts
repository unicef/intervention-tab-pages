import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-modules-common/dist/layout/icons-actions';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import ReportingReqPastDatesCheckMixin from '../mixins/reporting-req-past-dates-check';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import {reportingRequirementsListStyles} from '../styles/reporting-requirements-lists-styles';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {AnyObject} from '@unicef-polymer/etools-types';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {translate} from 'lit-translate';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {EtoolsPaginator} from '@unicef-polymer/etools-unicef/src/etools-table/pagination/etools-pagination';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

/**
 * @LitElement
 * @customElement
 * @appliesMixin ReportingReqPastDatesCheckMixin
 * @appliesMixin ReportingRequirementsCommonMixin
 */

@customElement('hru-list')
export class HruList extends ReportingReqPastDatesCheckMixin(ReportingRequirementsCommonMixin(LitElement)) {
  static get styles() {
    return [layoutStyles, reportingRequirementsListStyles];
  }
  render() {
    if (!this.hruData) {
      return;
    }
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit}:host([with-scroll]) {
          max-height: 400px;
          overflow-y: auto;
        }
      </style>

      <etools-data-table-header no-collapse no-title>
        <etools-data-table-column class="col-1 index-col">ID</etools-data-table-column>
        <etools-data-table-column class="col-9">${translate('REPORT_END_DATE')}</etools-data-table-column>
        <etools-data-table-column class="col-2"></etools-data-table-column>
      </etools-data-table-header>
      ${this.hruData.map(
        (item: any, index) => html` <etools-data-table-row
          no-collapse
          ?secondary-bg-on-hover="${!this._canEdit(this.editMode)}"
        >
          <div slot="row-data" class="layout-horizontal editable-row">
            <div class="col-data col-1 index-col">${this._getIndex(index)}</div>
            <div class="col-data col-9">${this.getDateDisplayValue(item.end_date)}</div>
            <div class="col-data col-2 actions">
              <etools-icon-button
                name="delete"
                ?hidden="${!this.editMode}"
                @click="${() => this._deleteHruReq(index)}"
              ></etools-icon-button>
            </div>
          </div>
        </etools-data-table-row>`
      )}
    `;
  }

  @property({type: Array})
  hruData: AnyObject[] = [];

  @property({type: Boolean})
  _listItemEditable = false;

  @property({type: Boolean})
  disableSorting = false;

  @property({type: Object})
  paginator: EtoolsPaginator | null = null;

  _interventionId!: number;

  set interventionId(interventionId) {
    this._interventionId = interventionId;
    this._sortReportingReq(this.hruData);
  }

  @property({type: String})
  get interventionId() {
    return this._interventionId;
  }

  _sortReportingReq(data: any) {
    if (this.disableSorting) {
      return;
    }
    if (isEmptyObject(data)) {
      return;
    }
    this._sortRequirementsAsc();
  }

  _sortRequirementsAsc() {
    this.hruData.sort((a: any, b: any) => {
      // @ts-ignore
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }

  _getIndex(index: number) {
    if (this.paginator) {
      return index + 1 + this.paginator.page_size * (this.paginator.page - 1);
    }
    return index + 1;
  }

  _deleteHruReq(index: number) {
    fireEvent(this, 'delete-hru', {
      index: index
    });
  }
}

export {HruList as HruListEl};
