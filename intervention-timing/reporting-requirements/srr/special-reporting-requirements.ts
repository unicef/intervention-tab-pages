import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';

import '@unicef-polymer/etools-modules-common/dist/layout/icons-actions';
import './add-edit-special-rep-req';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import {reportingRequirementsListStyles} from '../styles/reporting-requirements-lists-styles';
import CONSTANTS from '../../../common/constants';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {translate, get as getTranslation} from 'lit-translate';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import cloneDeep from 'lodash-es/cloneDeep';
import {EtoolsEndpoint} from '@unicef-polymer/etools-types';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

/**
 * @customElement
 * @LitElement
 * @mixinFunction
 * @appliesMixin ReportingRequirementsCommonMixin
 */
@customElement('special-reporting-requirements')
export class SpecialReportingRequirements extends PaginationMixin(ReportingRequirementsCommonMixin(LitElement)) {
  static get styles() {
    return [layoutStyles, reportingRequirementsListStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit}
        .mt-10 {
          margin-block-start: 10px;
        }
      </style>

      <div class="col-12 mt-10" ?hidden="${!this._empty(this.reportingRequirements)}">
          ${translate('NO_SPECIAL_REPORTING_REQUIREMENTS')}
      </div>

      <div class="col-12 mt-10" ?hidden="${!this.editMode}">
        <etools-button variant="text" class="no-marg no-pad font-14" @click="${this._openAddDialog}">
          ${translate('ADD_REQUIREMENTS')}
        </etools-button>
      </div>

      <div class="col-12" ?hidden="${this._empty(this.reportingRequirements)}">
        <etools-data-table-header no-collapse no-title>
          <etools-data-table-column class="col-1 index-col">ID</etools-data-table-column>
          <etools-data-table-column class="col-3">${translate('DUE_DATE')}</etools-data-table-column>
          <etools-data-table-column class="col-6">${translate('REPORTING_REQUIREMENT')}</etools-data-table-column>
          <etools-data-table-column class="col-2"></etools-data-table-column>
        </etools-data-table-header>
        ${(this.paginatedReports || []).map(
          (item: any, index: number) => html` <etools-data-table-row no-collapse secondary-bg-on-hover>
            <div slot="row-data" class="layout-horizontal editable-row">
              <div class="col-data col-1 index-col">${this._getIndex(index)}</div>
              <div class="col-data col-3">${this.getDateDisplayValue(item.due_date)}</div>
              <div class="col-data col-6">${item.description}</div>
              <div class="col-data col-2 actions">
                <etools-icon-button name="create" @click="${() => this._onEdit(index)}"></etools-icon-button>
                <etools-icon-button name="delete" @click="${() => this._onDelete(index)}"></etools-icon-button>
              </div>
            </div>
          </etools-data-table-row>`
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
      </div>
    `;
  }

  @property({type: Array})
  paginatedReports!: any[];

  @property({type: Boolean})
  editMode!: boolean;

  @property({type: Number})
  _itemToDeleteIndex = -1;

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  _addEventListeners() {
    this._onEdit = this._onEdit.bind(this);
    this._onDelete = this._onDelete.bind(this);
    this.addEventListener('reporting-requirements-loaded', this.dataWasLoaded as any);

    this.addEventListener('edit', this._onEdit as any);
    this.addEventListener('delete', this._onDelete as any);
  }

  _removeEventListeners() {
    this.removeEventListener('edit', this._onEdit as any);
    this.removeEventListener('delete', this._onDelete as any);
    this.removeEventListener('reporting-requirements-loaded', this.dataWasLoaded as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
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

  _onEdit(index?: number) {
    openDialog({
      dialog: 'add-edit-special-rep-req',
      dialogData: {
        item: typeof index === 'undefined' ? {} : cloneDeep(this.reportingRequirements[index!]),
        interventionId: this.interventionId
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return;
      }
      this._onSpecialReportingRequirementsSaved(response);
    });
  }

  _openAddDialog() {
    this._onEdit();
  }

  async _onDelete(itemIndex: number) {
    if (itemIndex !== null) {
      this._itemToDeleteIndex = itemIndex;

      const confirmed = await openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          content: getTranslation('DELETE_SPECIAL_REPORTING_REQUIREMENT_PROMPT'),
          confirmBtnText: translate('YES'),
          cancelBtnText: translate('NO')
        }
      }).then(({confirmed}) => {
        return confirmed;
      });

      this._onDeleteConfirmation({detail: {confirmed: confirmed}});
    }
  }

  _onDeleteConfirmation(e: any) {
    if (!e.detail.confirmed) {
      this._itemToDeleteIndex = -1;
      return;
    }
    const reportingRequirementsOriginal = this.reportingRequirements;
    if (this._itemToDeleteIndex > -1) {
      const itemToDelete = this.reportingRequirements[this._itemToDeleteIndex] as any;
      const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(
        interventionEndpoints.specialReportingRequirementsUpdate,
        {
          reportId: itemToDelete.id
        }
      );
      sendRequest({
        method: 'DELETE',
        endpoint: endpoint
      })
        .then(() => {
          reportingRequirementsOriginal.splice(this._itemToDeleteIndex, 1);
          this.reportingRequirements = [...reportingRequirementsOriginal];
          this.paginator = {...this.paginator, page: 1};
          this.requestUpdate();
        })
        .catch((error: any) => {
          EtoolsLogger.error('Failed to delete special report requirement!', 'special-reporting-requirements', error);
          parseRequestErrorsAndShowAsToastMsgs(error, this);
        })
        .then(() => {
          // delete complete, reset _itemToDeleteIndex
          this._itemToDeleteIndex = -1;
        });
    }
  }

  _sortRequirementsAsc() {
    this.reportingRequirements.sort((a: string, b: string) => {
      // @ts-ignore
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }

  _getReportType() {
    return CONSTANTS.REQUIREMENTS_REPORT_TYPE.SPECIAL;
  }

  _getIndexById(id: number) {
    return this.reportingRequirements.findIndex((r: any) => r.id === id);
  }

  _onSpecialReportingRequirementsSaved(savedReqItem: any) {
    const index = this._getIndexById(savedReqItem.id);
    const reportingRequirementsOriginal = [...this.reportingRequirements];
    if (index > -1) {
      // edit
      reportingRequirementsOriginal.splice(index, 1, savedReqItem);
    } else {
      // add
      reportingRequirementsOriginal.push(savedReqItem);
    }
    this.reportingRequirements = [...reportingRequirementsOriginal];
    this.paginator = {...this.paginator, page: 1};
    this.updateReportingRequirements(this.reportingRequirements, CONSTANTS.REQUIREMENTS_REPORT_TYPE.SR);
    this.requestUpdate();
  }
}
