import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-data-table/etools-data-table';

import {createDynamicDialog} from '@unicef-polymer/etools-dialog/dynamic-dialog';
import '../../../common/layout/icons-actions';
import './add-edit-special-rep-req';
import CommonMixin from '../../../common/mixins/common-mixin';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import {gridLayoutStylesLit} from '../../../common/styles/grid-layout-styles-lit';
import {reportingRequirementsListStyles} from '../styles/reporting-requirements-lists-styles';
import CONSTANTS from '../../../common/constants';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {AddEditSpecialRepReqEl} from './add-edit-special-rep-req';
import EtoolsDialog from '@unicef-polymer/etools-dialog';
import {getEndpoint} from '../../../utils/endpoint-helper';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {sharedStyles} from '../../../common/styles/shared-styles-lit';
import {buttonsStyles} from '../../../common/styles/button-styles';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';

/**
 * @customElement
 * @polymer
 * @mixinFunction
 * @appliesMixin CommonMixin
 * @appliesMixin ReportingRequirementsCommonMixin
 */
@customElement('special-reporting-requirements')
export class SpecialReportingRequirements extends CommonMixin(ReportingRequirementsCommonMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles, reportingRequirementsListStyles];
  }
  render() {
    return html`
      <style>
        ${sharedStyles} ${dataTableStylesLit}
      </style>

      <div class="row-h" ?hidden="${!this._empty(this.reportingRequirements)}">
        There are no special reporting requirements set.
      </div>

      <div class="row-h">
        <paper-button class="secondary-btn" @click="${this._openAddDialog}"> ADD REQUIREMENTS </paper-button>
      </div>

      <div class="flex-c" ?hidden="${this._empty(this.reportingRequirements)}">
        <etools-data-table-header no-collapse no-title>
          <etools-data-table-column class="col-1 right-align index-col">ID</etools-data-table-column>
          <etools-data-table-column class="col-3">Due Date</etools-data-table-column>
          <etools-data-table-column class="flex-6">Reporting Requirements</etools-data-table-column>
          <etools-data-table-column class="flex-c"></etools-data-table-column>
        </etools-data-table-header>
        ${this.reportingRequirements.map(
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
      </div>
    `;
  }

  @property({type: Object})
  addEditDialog!: AddEditSpecialRepReqEl;

  @property({type: Object})
  _deleteConfirmationDialog!: EtoolsDialog;

  @property({type: Number})
  _itemToDeleteIndex = -1;

  connectedCallback() {
    super.connectedCallback();
    this._createAddEditDialog();
    this._createDeleteConfirmationsDialog();
    this._addEventListeners();
  }

  _addEventListeners() {
    this._onEdit = this._onEdit.bind(this);
    this._onDelete = this._onDelete.bind(this);

    this.addEventListener('edit', this._onEdit as any);
    this.addEventListener('delete', this._onDelete as any);
  }

  _removeEventListeners() {
    this.removeEventListener('edit', this._onEdit as any);
    this.removeEventListener('delete', this._onDelete as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
    this._removeAddEditDialog();
    this._removeDeleteConfirmationsDialog();
  }

  _onEdit(index: number) {
    this._setDialogData(index);
    this.addEditDialog.opened = true;
  }

  _setDialogData(index: number) {
    this.addEditDialog.interventionId = this.interventionId;
    this.addEditDialog.item = this.reportingRequirements[index];
  }

  _onDelete(itemIndex: number) {
    if (this._deleteConfirmationDialog) {
      if (itemIndex !== null) {
        this._itemToDeleteIndex = itemIndex;
      }
      this._deleteConfirmationDialog.opened = true;
    }
  }

  _onDeleteConfirmation(e: CustomEvent) {
    if (!e.detail.confirmed) {
      this._itemToDeleteIndex = -1;
      return;
    }

    if (this._itemToDeleteIndex > -1) {
      const itemToDelete = this.reportingRequirements[this._itemToDeleteIndex] as any;
      const endpoint = getEndpoint(interventionEndpoints.specialReportingRequirementsUpdate, {
        reportId: itemToDelete.id
      });
      sendRequest({
        method: 'DELETE',
        endpoint: endpoint
      })
        .then(() => {
          this.reportingRequirements.splice(this._itemToDeleteIndex, 1);
        })
        .catch((error: any) => {
          logError('Failed to delete special report requirement!', 'special-reporting-requirements', error);
          parseRequestErrorsAndShowAsToastMsgs(error, this);
        })
        .then(() => {
          // delete complete, reset _itemToDeleteIndex
          this._itemToDeleteIndex = -1;
        });
    }
  }

  _createAddEditDialog() {
    if (this.reportingRequirements) {
      this.addEditDialog = document.createElement('add-edit-special-rep-req') as AddEditSpecialRepReqEl;
      this._onSpecialReportingRequirementsSaved = this._onSpecialReportingRequirementsSaved.bind(this);
      this.addEditDialog.addEventListener(
        'reporting-requirements-saved',
        this._onSpecialReportingRequirementsSaved as any
      );

      document.querySelector('body')!.appendChild(this.addEditDialog);
    }
  }

  _removeAddEditDialog() {
    if (this.addEditDialog) {
      this.addEditDialog.removeEventListener(
        'reporting-requirements-saved',
        this._onSpecialReportingRequirementsSaved as any
      );
      document.querySelector('body')!.removeChild(this.addEditDialog);
    }
  }

  _createDeleteConfirmationsDialog() {
    this._onDeleteConfirmation = this._onDeleteConfirmation.bind(this);
    const confirmationMSg = document.createElement('span');
    confirmationMSg.innerText = 'Are you sure you want to delete this Special Reporting Requirement?';
    const confirmationDialogConf = {
      title: 'Delete Special Reporting Requirement',
      size: 'md',
      okBtnText: 'Yes',
      cancelBtnText: 'No',
      closeCallback: this._onDeleteConfirmation,
      content: confirmationMSg
    };
    this._deleteConfirmationDialog = createDynamicDialog(confirmationDialogConf);
  }

  _removeDeleteConfirmationsDialog() {
    if (this._deleteConfirmationDialog) {
      this._deleteConfirmationDialog.removeEventListener('close', this._onDeleteConfirmation as any);
      document.querySelector('body')!.removeChild(this._deleteConfirmationDialog);
    }
  }

  _openAddDialog() {
    this.addEditDialog.item = {};
    this.addEditDialog.interventionId = this.interventionId;
    this.addEditDialog.opened = true;
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

  _onSpecialReportingRequirementsSaved(e: CustomEvent) {
    const savedReqItem = e.detail;
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
    this.requestUpdate();
  }
}
