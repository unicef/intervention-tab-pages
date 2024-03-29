import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-data-table/etools-data-table';

import '@unicef-polymer/etools-modules-common/dist/layout/icons-actions';
import './add-edit-special-rep-req';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import {reportingRequirementsListStyles} from '../styles/reporting-requirements-lists-styles';
import CONSTANTS from '../../../common/constants';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';
import {translate, get as getTranslation} from 'lit-translate';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import cloneDeep from 'lodash-es/cloneDeep';
import {EtoolsEndpoint} from '@unicef-polymer/etools-types';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';

/**
 * @customElement
 * @polymer
 * @mixinFunction
 * @appliesMixin ReportingRequirementsCommonMixin
 */
@customElement('special-reporting-requirements')
export class SpecialReportingRequirements extends PaginationMixin(ReportingRequirementsCommonMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles, reportingRequirementsListStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit}
      </style>

      <div class="row-h" ?hidden="${!this._empty(this.reportingRequirements)}">
        ${translate('NO_SPECIAL_REPORTING_REQUIREMENTS')}
      </div>

      <div class="row-h" ?hidden="${!this.editMode}">
        <paper-button class="secondary-btn" @click="${this._openAddDialog}"
          >${translate('ADD_REQUIREMENTS')}</paper-button
        >
      </div>

      <div class="flex-c" ?hidden="${this._empty(this.reportingRequirements)}">
        <etools-data-table-header no-collapse no-title>
          <etools-data-table-column class="col-1 right-align index-col">ID</etools-data-table-column>
          <etools-data-table-column class="col-3">${translate('DUE_DATE')}</etools-data-table-column>
          <etools-data-table-column class="flex-6">${translate('REPORTING_REQUIREMENT')}</etools-data-table-column>
          <etools-data-table-column class="flex-c"></etools-data-table-column>
        </etools-data-table-header>
        ${(this.paginatedReports || []).map(
          (item: any, index: number) => html` <etools-data-table-row no-collapse secondary-bg-on-hover>
            <div slot="row-data" class="layout-horizontal editable-row">
              <div class="col-data col-1 right-align index-col">${this._getIndex(index)}</div>
              <div class="col-data col-3">${this.getDateDisplayValue(item.due_date)}</div>
              <div class="col-data col-6">${item.description}</div>
              <div class="col-data flex-c actions">
                <paper-icon-button icon="icons:create" @click="${() => this._onEdit(index)}"></paper-icon-button>
                <paper-icon-button icon="icons:delete" @click="${() => this._onDelete(index)}"></paper-icon-button>
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
      const endpoint = getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(
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
