import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '../../../common/layout/icons-actions';
import CommonMixin from '../../../common/mixins/common-mixin';
import {fireEvent} from '../../../utils/fire-custom-event';
import ReportingReqPastDatesCheckMixin from '../mixins/reporting-req-past-dates-check';
import {gridLayoutStylesLit} from '../../../common/styles/grid-layout-styles-lit';
import {reportingRequirementsListStyles} from '../styles/reporting-requirements-lists-styles';
import {IconsActionsEl} from '../../../common/layout/icons-actions';
import {isEmptyObject} from '../../../utils/utils';
import {AnyObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin ReportingReqPastDatesCheckMixin
 */

@customElement('hru-list')
export class HruList extends CommonMixin(ReportingReqPastDatesCheckMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      ${reportingRequirementsListStyles}
      <style include="data-table-styles">
        :host([with-scroll]) {
          max-height: 400px;
          overflow-y: auto;
        }
        etools-data-table-row {
          --icons-actions_-_background-color: transparent !important;
        }
      </style>

      <etools-data-table-header no-collapse no-title>
        <etools-data-table-column class="col-1 right-align index-col">ID</etools-data-table-column>
        <etools-data-table-column class="flex-c">Report End Date</etools-data-table-column>
        <etools-data-table-column class="col-1"></etools-data-table-column>
      </etools-data-table-header>
      ${this.hruData.forEach(
        (item: any, index) => html` <etools-data-table-row
          no-collapse
          ?secondary-bg-on-hover="${this._canEdit(this.editMode, this.inAmendment, item.due_date, item.id)}"
        >
          <div slot="row-data" style="${this._uneditableStyles(this.inAmendment, item.due_date, item.id)}">
            <span class="col-data col-1 right-align index-col">${this._getIndex(index, this.hruData)}</span>
            <span class="col-data flex-c">${this.getDateDisplayValue(item.end_date)}</span>
            <span class="col-data col-1 actions">
              <icons-actions-2
                ?hidden="${!this._canEdit(this.editMode, this.inAmendment, item.due_date, item.id)}"
                .data-args="${index}"
                @delete="${this._deleteHruReq}"
                showEdit="${this._listItemEditable}"
              >
              </icons-actions-2>
            </span>
          </div>
        </etools-data-table-row>`
      )}
    `;
  }

  @property({type: Array})
  hruData: AnyObject[] = [];

  @property({type: Boolean})
  _listItemEditable = false;

  @property({type: Object})
  hruMainEl!: LitElement & {_getIndex(idx: any): number | string};

  @property({type: Boolean})
  usePaginationIndex = false;

  @property({type: Boolean})
  disableSorting = false;

  // @DAN-> refactor static observers
  // static get observers() {
  //   return ['_sortReportingReq(hruData, hruData.length)'];
  // }

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

  _getIndex(index: any) {
    if (this.usePaginationIndex) {
      return this.hruMainEl._getIndex(index);
    }
    return parseInt(index, 10) + 1;
  }

  _deleteHruReq(e: CustomEvent) {
    fireEvent(this, 'delete-hru', {
      index: (e.target as IconsActionsEl).getAttribute('data-args')
    });
  }
}

export {HruList as HruListEl};
