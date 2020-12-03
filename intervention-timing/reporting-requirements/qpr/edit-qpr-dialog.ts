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
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import {QprListEl} from './qpr-list.js';
import {fireEvent} from '../../../utils/fire-custom-event';
import {AnyObject} from '@unicef-polymer/etools-types';
import moment from 'moment';
import {buttonsStyles} from '../../../common/styles/button-styles';

/**
 * @polymer
 * @customElement
 */
@customElement('edit-qpr-dialog')
export class EditQprDialog extends LitElement {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
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
        @confirm-btn-clicked="${() => this._saveModifiedQprData()}"
        @close="${() => this.closeQprDialog()}"
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
          always-show-row-actions
          ?editMode="${true}"
        ></qpr-list>
      </etools-dialog>

      <!-- add or edit a QPR row -->
      <etools-dialog
        id="addOrModifyQprDialog"
        size="lg"
        dialog-title="Edit Standard Quarterly Report Requirements"
        ?opened="${this.addOrModifyQprDialogOpened}"
        no-padding
        @confirm-btn-clicked="${() => this._updateQprData()}"
        @close="${() => this.handleDialogClosed()}"
        keep-dialog-open
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
              pretty-date="${this._editedQprDatesSet!.start_date ? this._editedQprDatesSet!.start_date : ''}"
              format="YYYY-MM-DD"
              @date-changed="${({detail}: CustomEvent) => this.changed(detail.value, 'start_date')}"
              hide-header
            >
            </calendar-lite>
          </div>
          <div class="col layout-vertical">
            <iron-label for="endDate"> End Date </iron-label>
            <calendar-lite
              id="endDate"
              pretty-date="${this._editedQprDatesSet!.end_date ? this._editedQprDatesSet!.end_date : ''}"
              format="YYYY-MM-DD"
              @date-changed="${({detail}: CustomEvent) => this.changed(detail.value, 'end_date')}"
              hide-header
            >
            </calendar-lite>
          </div>
          <div class="col layout-vertical">
            <iron-label for="dueDate"> Due Date </iron-label>
            <calendar-lite
              id="dueDate"
              pretty-date="${this._editedQprDatesSet!.due_date ? this._editedQprDatesSet!.due_date : ''}"
              format="YYYY-MM-DD"
              @date-changed="${({detail}: CustomEvent) => this.changed(detail.value, 'due_date')}"
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

  _qprData!: any;

  set qprData(qprData) {
    this._qprData = qprData;
  }

  @property({type: Array})
  get qprData() {
    return this._qprData;
  }

  changed(value: string, item: string) {
    if (this._editedQprDatesSet) {
      const newDate = moment(new Date(value)).format('YYYY-MM-DD');
      this._editedQprDatesSet[item] = newDate;
    }
  }

  handleDialogClosed() {
    this.addOrModifyQprDialogOpened = false;
  }

  openQprDialog() {
    (this.editQprDialog as EtoolsDialog).opened = true;
    this.addEventListener('edit-qpr', this._editQprDatesSet as any);
  }

  closeQprDialog() {
    (this.editQprDialog as EtoolsDialog).opened = false;
    this.removeEventListener('edit-qpr', this._editQprDatesSet as any);
  }

  _addNewQpr() {
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

  _updateQprData() {
    if (!this._validateDataBeforeAdd()) {
      this.addOrModifyQprDialogOpened = true;
      return;
    }
    this.addOrModifyQprDialogOpened = false;
    if (this._qprDatesSetEditedIndex < 0) {
      // add
      this.qprData.push(this._editedQprDatesSet);
    } else {
      // edit
      this.qprData.splice(this._qprDatesSetEditedIndex, 1, this._editedQprDatesSet);
    }
    this._qprDatesSetEditedIndex = -1;
    this.addOrModifyQprDialogOpened = false;
    this.requestUpdate();
  }

  _editQprDatesSet(e: CustomEvent, qprData: any) {
    if (!this.qprData) {
      this.qprData = qprData;
    }
    this._qprDatesSetEditedIndex = e.detail.index;
    this._editedQprDatesSet = Object.assign({}, this.qprData[this._qprDatesSetEditedIndex]);
    this.addOrModifyQprDialogOpened = true;
  }

  _deleteQprDatesSet(index: number) {
    this.qprData.splice(index, 1);
  }

  _hideEditedIndexInfo(index: number) {
    return index === -1;
  }

  _getEditedQprDatesSetId(index: number) {
    const dialog = this.shadowRoot!.querySelector(`#qpr-list`) as QprListEl;
    if (dialog) {
      return dialog.getIndex(index, this.qprData.length);
    }
    return;
  }

  _saveModifiedQprData() {
    console.log('saveDATA');
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
    const date = prepareDatepickerDate(dateStr);
    if (date === null) {
      const now = moment(new Date()).format('YYYY-MM-DD');
      this._editedQprDatesSet.start_date = now;
      this._editedQprDatesSet.end_date = now;
      this._editedQprDatesSet.due_date = now;
      return prepareDatepickerDate(now);
    } else {
      return date;
    }
  }
}

export {EditQprDialog as EditQprDialogEl};
