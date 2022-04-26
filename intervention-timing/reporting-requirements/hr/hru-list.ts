import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-modules-common/dist/layout/icons-actions';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import ReportingReqPastDatesCheckMixin from '../mixins/reporting-req-past-dates-check';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import {reportingRequirementsListStyles} from '../styles/reporting-requirements-lists-styles';
import {isEmptyObject} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {AnyObject} from '@unicef-polymer/etools-types';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';
import {translate} from 'lit-translate';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {EtoolsPaginator} from '@unicef-polymer/etools-table/pagination/etools-pagination';

/**
 * @polymer
 * @customElement
 * @appliesMixin ReportingReqPastDatesCheckMixin
 * @appliesMixin ReportingRequirementsCommonMixin
 */

@customElement('hru-list')
export class HruList extends ReportingReqPastDatesCheckMixin(ReportingRequirementsCommonMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, reportingRequirementsListStyles];
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
        <etools-data-table-column class="col-1 right-align index-col">ID</etools-data-table-column>
        <etools-data-table-column class="flex-c">${translate('REPORT_END_DATE')}</etools-data-table-column>
        <etools-data-table-column class="col-2"></etools-data-table-column>
      </etools-data-table-header>
      ${this.hruData.map(
        (item: any, index) => html` <etools-data-table-row
          no-collapse
          ?secondary-bg-on-hover="${!this._canEdit(this.editMode)}"
        >
          <div slot="row-data" class="layout-horizontal editable-row">
            <div class="col-data col-1 right-align index-col">${this._getIndex(index)}</div>
            <div class="col-data flex-c">${this.getDateDisplayValue(item.end_date)}</div>
            <div class="col-data col-2 actions">
              <paper-icon-button
                icon="icons:delete"
                ?hidden="${!this.editMode}"
                @click="${() => this._deleteHruReq(index)}"
              ></paper-icon-button>
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
