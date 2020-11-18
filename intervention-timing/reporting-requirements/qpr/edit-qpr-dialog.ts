import {LitElement, html, property, query, customElement} from 'lit-element';
import '@polymer/iron-label/iron-label';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-dialog/etools-dialog';

import {prepareDatepickerDate} from '../../../utils/date-utils';
// import EndpointsMixin from '../mixins/endpoints-mixin';
import {getEndpoint} from '../../../utils/endpoint-helper';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import './qpr-list.js';
import CONSTANTS from '../../../common/constants';
import '@unicef-polymer/etools-date-time/calendar-lite.js';
import {gridLayoutStylesLit} from '../../../common/styles/grid-layout-styles-lit';
import {buttonsStylesLitContent} from '../styles/buttons-styles-polymer';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import {QprListEl} from './qpr-list.js';
import {fireEvent} from '../../../utils/fire-custom-event';
import {AnyObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 */
@customElement('edit-qpr-dialog')
export class EditQprDialog extends LitElement {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStylesLitContent];
  }
  render() {
    return html`
      <style>
        *[hidden] {
          display: none !important;
        }

        #qpr-edit-info {
          margin-right: 24px;
        }

        qpr-list {
          margin-top: 24px;
        }

        iron-label {
          margin-bottom: 24px;
        }

        calendar-lite {
          position: relative;
          width: 268px;
          height: 100%;
        }
      </style>

      <etools-dialog
        id="editQprDialog"
        size="lg"
        dialog-title="Edit Quarterly Progress Reporting Requirements"
        ?hidden="${this.addOrModifyQprDialogOpened}"
        @confirm-btn-clicked="${this._saveModifiedQprData}"
        ok-btn-text="Save"
        keep-dialog-open
        spinner-text="Saving..."
      >
        <div class="layout-horizontal">
          <span id="qpr-edit-info">All dates in the future can be edited before saving. | Or</span>
          <paper-button class="secondary-btn" @click="${this._addNewQpr}"> Add Requirement </paper-button>
        </div>

        <qpr-list
          id="qprList"
          with-scroll
          .qprData="${this.qprData}"
          edit-mode
          .inAmendment="${this.inAmendment}"
          @edit-qpr="${this._editQprDatesSet}"
          @delete-qpr="${this._deleteQprDatesSet}"
          always-show-row-actions
        ></qpr-list>
      </etools-dialog>

      <!-- add or edit a QPR row -->
      <etools-dialog
        id="addOrModifyQprDialog"
        size="lg"
        dialog-title="Edit Standard Quarterly Report Requirements"
        ?opened="${this.addOrModifyQprDialogOpened}"
        no-padding
        @close="${this._updateQprData}"
        ok-btn-text="Save"
      >
        <div class="row-h" ?hidden="${this._hideEditedIndexInfo(this._qprDatesSetEditedIndex)}">
          You are editing ID ${this._getEditedQprDatesSetId(this._qprDatesSetEditedIndex)}
        </div>

        <div class="row-h">
          <div class="col layout-vertical">
            <iron-label for="startDate"> Start Date </iron-label>
            <calendar-lite
              id="startDate"
              date="${this.prepareDatepickerDate(this._editedQprDatesSet!.start_date)}"
              pretty-date="${this._editedQprDatesSet!.start_date}"
              format="YYYY-MM-DD"
              hide-header
            >
            </calendar-lite>
          </div>
          <div class="col layout-vertical">
            <iron-label for="endDate"> End Date </iron-label>
            <calendar-lite
              id="endDate"
              date="${this.prepareDatepickerDate(this._editedQprDatesSet!.end_date)}"
              pretty-date="${this._editedQprDatesSet!.end_date}"
              format="YYYY-MM-DD"
              hide-header
            >
            </calendar-lite>
          </div>
          <div class="col layout-vertical">
            <iron-label for="dueDate"> Due Date </iron-label>
            <calendar-lite
              id="dueDate"
              date="${this.prepareDatepickerDate(this._editedQprDatesSet!.due_date)}"
              pretty-date="${this._editedQprDatesSet!.due_date}"
              format="YYYY-MM-DD"
              hide-header
            >
            </calendar-lite>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Number})
  interventionId!: number;

  @property({type: Boolean})
  inAmendment!: boolean;

  @property({type: Array})
  qprData: AnyObject[] = [];

  @property({type: Boolean})
  addOrModifyQprDialogOpened = false;

  @property({type: Object})
  _qprDatesSetModel = {
    start_date: null,
    end_date: null,
    due_date: null
  };

  @property({type: Object})
  _editedQprDatesSet: AnyObject = {start_date: null, end_date: null, due_date: null};

  @property({type: Number})
  _qprDatesSetEditedIndex = -1;

  @query('#editQprDialog')
  editQprDialog!: EtoolsDialog;

  @query('#qprList')
  qprList!: QprListEl;

  openQprDialog() {
    (this.editQprDialog as EtoolsDialog).opened = true;
  }

  closeQprDialog() {
    (this.editQprDialog as EtoolsDialog).opened = false;
  }

  _addNewQpr() {
    // @DAN: check these, and similar with this
    // this.set('_editedQprDatesSet', Object.assign({}, this._qprDatesSetModel));
    // this.set('addOrModifyQprDialogOpened', true);
    this._editedQprDatesSet = Object.assign({}, this._qprDatesSetModel);
    this.addOrModifyQprDialogOpened = true;
  }

  _duplicateDueDate(dueDate: any) {
    const foundQpr = this.qprData.find((d: any) => d.due_date === dueDate);
    if (this._qprDatesSetEditedIndex > -1 && foundQpr) {
      const foundQprIndex = this.qprData.indexOf(foundQpr);
      return foundQprIndex !== +this._qprDatesSetEditedIndex;
    }
    return !!foundQpr;
  }

  _validateDataBeforeAdd() {
    if (!this._editedQprDatesSet.due_date || !this._editedQprDatesSet.start_date || !this._editedQprDatesSet.end_date) {
      fireEvent(this, 'toast', {
        text: 'Start, end & due dates are required.',
        showCloseBtn: true
      });
      return false;
    }
    if (this._duplicateDueDate(this._editedQprDatesSet.due_date)) {
      fireEvent(this, 'toast', {
        text: 'Requirement dates not added, selected Due Date is already in the list.',
        showCloseBtn: true
      });
      return false;
    }
    return true;
  }

  _updateQprData(e: CustomEvent) {
    if (!e.detail.confirmed) {
      return;
    }
    if (!this._validateDataBeforeAdd()) {
      // this.set('addOrModifyQprDialogOpened', true);
      this.addOrModifyQprDialogOpened = true;
      return;
    }
    // this.set('addOrModifyQprDialogOpened', false);
    this.addOrModifyQprDialogOpened = false;
    if (this._qprDatesSetEditedIndex < 0) {
      // add
      // this.push('qprData', this._editedQprDatesSet);
      this.qprData.push(this._editedQprDatesSet);
    } else {
      // edit
      // this.splice('qprData', this._qprDatesSetEditedIndex, 1, this._editedQprDatesSet);
      this.qprData.splice(this._qprDatesSetEditedIndex, 1, this._editedQprDatesSet);
    }
    // this.set('_qprDatesSetEditedIndex', -1);
    this._qprDatesSetEditedIndex = -1;
  }

  _editQprDatesSet(e: CustomEvent) {
    // this.set('_qprDatesSetEditedIndex', e.detail.index);
    this._qprDatesSetEditedIndex = e.detail.index;
    // this.set('_editedQprDatesSet', Object.assign({}, this.qprData[this._qprDatesSetEditedIndex]));
    this._editedQprDatesSet = Object.assign({}, this.qprData[this._qprDatesSetEditedIndex]);
    // this.set('addOrModifyQprDialogOpened', true);
    this.addOrModifyQprDialogOpened = true;
  }

  _deleteQprDatesSet(e: CustomEvent) {
    // this.splice('qprData', e.detail.index, 1);
    this.qprData.splice(e.detail.index, 1);
  }

  _hideEditedIndexInfo(index: number) {
    return index === -1;
  }

  _getEditedQprDatesSetId(index: number) {
    // return (this.shadowRoot!.querySelector(`#qpr-list`) as QprListEl).getIndex(index, this.qprData.length);
    if (!this.qprData) {
      return;
    }
    return (this.qprList as QprListEl).getIndex(index, this.qprData.length);
  }

  _saveModifiedQprData() {
    const endpoint = getEndpoint(interventionEndpoints.reportingRequirements, {
      intervId: this.interventionId,
      reportType: CONSTANTS.REQUIREMENTS_REPORT_TYPE.QPR
    });
    const dialog = this.editQprDialog as EtoolsDialog;
    dialog.startSpinner();
    sendRequest({
      method: 'POST',
      endpoint: endpoint,
      body: {reporting_requirements: this.qprData}
    })
      .then((response: any) => {
        fireEvent(this, 'reporting-requirements-saved', response.reporting_requirements);
        dialog.stopSpinner();
        this.closeQprDialog();
      })
      .catch((error: any) => {
        logError('Failed to save/update qpr data!', 'edit-qpr-dialog', error);
        parseRequestErrorsAndShowAsToastMsgs(error, this);
        dialog.stopSpinner();
      });
  }

  prepareDatepickerDate(dateStr: string) {
    return prepareDatepickerDate(dateStr);
  }
}

export {EditQprDialog as EditQprDialogEl};
