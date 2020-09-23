/* eslint-disable lit/no-legacy-template-syntax */
import {PolymerElement, html} from '@polymer/polymer';
import '@unicef-polymer/etools-data-table/etools-data-table.js';

import '../../../common/layout/icons-actions';
import '../mixins/reporting-req-past-dates-check';
import '../styles/reporting-requirements-lists-styles';
import CommonMixin from '../../../common/mixins/common-mixin';
import ReportingReqPastDatesCheckMixin from '../mixins/reporting-req-past-dates-check';
import {gridLayoutStylesPolymer} from '../../../common/styles/grid-layout-styles-polymer';
import {reportingRequirementsListStyles} from '../styles/reporting-requirements-lists-styles';
import {fireEvent} from '../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import {IconsActionsEl} from '../../../common/layout/icons-actions';
import {isEmptyObject} from '../../../utils/utils';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin ReportingReqPastDatesCheckMixin
 */
class QprList extends CommonMixin(ReportingReqPastDatesCheckMixin(PolymerElement)) {
  static get template() {
    return html`
      ${reportingRequirementsListStyles}${gridLayoutStylesPolymer()}
      <style include="data-table-styles">
        etools-data-table-row {
          --icons-actions_-_background-color: transparent !important;
        }
      </style>

      <etools-data-table-header no-collapse no-title>
        <etools-data-table-column class="col-1 right-align index-col">ID</etools-data-table-column>
        <etools-data-table-column class="col-3">Start Date</etools-data-table-column>
        <etools-data-table-column class="col-3">End Date</etools-data-table-column>
        <etools-data-table-column class="col-3">Due Date</etools-data-table-column>
        <etools-data-table-column class="flex-c"></etools-data-table-column>
      </etools-data-table-header>

      <template is="dom-repeat" items="[[qprData]]">
        <etools-data-table-row
          no-collapse
          secondary-bg-on-hover$="[[_canEdit(editMode, inAmendment, item.due_date, item.id)]]"
        >
          <div slot="row-data" style$="[[_uneditableStyles(inAmendment, item.due_date, item.id)]]">
            <span class="col-data col-1 right-align index-col">[[getIndex(index, qprData.length)]]</span>
            <span class="col-data col-3">[[getDateDisplayValue(item.start_date)]]</span>
            <span class="col-data col-3">[[getDateDisplayValue(item.end_date)]]</span>
            <span class="col-data col-3">[[getDateDisplayValue(item.due_date)]]</span>
            <span class="col-data flex-c actions">
              <icons-actions-2
                hidden$="[[!_canEdit(editMode, inAmendment, item.due_date, item.id)]]"
                data-args$="[[index]]"
                on-edit="_editQprReq"
                on-delete="_deleteQprReq"
              >
              </icons-actions-2>
            </span>
          </div>
        </etools-data-table-row>
      </template>
    `;
  }

  @property({type: Array})
  qprData: [] = [];

  @property({type: Boolean})
  preventPastDateEdit = false;

  static get observers() {
    return ['_sortReportingReq(qprData, qprData.length)'];
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

  _editQprReq(e: CustomEvent) {
    fireEvent(this, 'edit-qpr', {
      index: (e.target as IconsActionsEl).getAttribute('data-args')
    });
  }

  _deleteQprReq(e: CustomEvent) {
    fireEvent(this, 'delete-qpr', {
      index: (e.target as IconsActionsEl).getAttribute('data-args')
    });
  }
}

window.customElements.define('qpr-list', QprList);
export {QprList as QprListEl};
