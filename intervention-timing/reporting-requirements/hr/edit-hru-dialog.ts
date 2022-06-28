import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-button/paper-button.js';
declare const dayjs: any;
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-date-time/calendar-lite';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import './hru-list.js';
import CONSTANTS from '../../../common/constants';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {isEmptyObject} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {AnyObject} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin.js';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit.js';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles.js';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */

@customElement('edit-hru-dialog')
export class EditHruDialog extends connectStore(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        *[hidden] {
          display: none !important;
        }

        #add-selected-date {
          display: inline-block;
          width: auto;
          margin-top: 24px;
          padding-right: 0;
        }

        .start-date {
          padding-bottom: 24px;
          max-width: 300px;
        }

        calendar-lite {
          position: relative;
        }
        #dtPickerStDate::part(dp-calendar) {
          height: 390px;
        }
      </style>

      <etools-dialog
        id="editHruDialog"
        size="lg"
        dialog-title=${translate('EDIT_DATES_HUMANITARIAN_REPORT')}
        @confirm-btn-clicked="${this._saveHurData}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        keep-dialog-open
        opened
        ?hidden="${this.datePickerOpen}"
        @close="${() => this._onClose()}"
        spinner-text=${translate('GENERAL.SAVING_DATA')}
      >
        <div class="start-date">
          <datepicker-lite
            id="dtPickerStDate"
            label=${translate('SELECT_START_DATE')}
            .value="${this.repStartDate}"
            required
            min-date="${this.interventionStart}"
            auto-validate
            open="${this.datePickerOpen}"
            selected-date-display-format="D MMM YYYY"
            fire-date-has-changed
            @date-has-changed="${(e: CustomEvent) => {
              this.repStartDate = e.detail.date;
            }}"
          >
          </datepicker-lite>
        </div>
        <div>${translate('HUMANITARIAN_REPORT_PROMPT')}</div>

        <div class="layout-horizontal row-padding-v">
          <div class="col layout-vertical col-6">
            <calendar-lite
              id="datepicker"
              min-date="${this.repStartDate}"
              pretty-date="${this.selectedDate ? this.selectedDate : ''}"
              @date-changed="${({detail}: CustomEvent) => this.changed(detail.value)}"
              format="YYYY-MM-DD"
              hide-header
            >
            </calendar-lite>
          </div>
          <div class="col col-6">
            <div class="row-h" ?hidden="${!this._empty(this.hruData.length)}">${translate('NO_DATES_ADDED')}</div>
            <hru-list
              id="hruList"
              class="flex-c"
              with-scroll
              .hruData="${this.hruData}"
              ?hidden="${this._empty(this.hruData.length)}"
              ?editMode="${true}"
              @delete-hru="${this._deleteHruDate}"
            >
            </hru-list>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col layout-vertical col-3">
            <paper-button id="add-selected-date" class="secondary-btn" @click="${() => this._addToList()}">
              ${translate('ADD_SELECTED_DATE')}
            </paper-button>
          </div>
        </div>
      </etools-dialog>
    `;
  }
  @property({type: Date})
  interventionStart!: Date | string;

  @property({type: Date})
  repStartDate!: Date | string;

  @property({type: String})
  selectedDate!: string;

  @property({type: Array})
  hruData: AnyObject[] = [];

  @property({type: Number})
  _hruEditedIndex = -1;

  @property({type: Boolean})
  datePickerOpen = false;

  _interventionId!: number;

  set interventionId(interventionId) {
    this._interventionId = interventionId;
  }

  @property({type: String})
  get interventionId() {
    return this._interventionId;
  }

  set dialogData(data: any) {
    const {hruData, selectedDate, interventionId, interventionStart}: any = data;
    this.hruData = hruData;
    this.selectedDate = selectedDate;
    this.interventionId = interventionId;
    this.interventionStart = interventionStart;


    this._setDefaultStartDate();
  }

  _setDefaultStartDate() {
    if (isEmptyObject(this.hruData)) {
      this.repStartDate = this.interventionStart;
    } else {
      this.repStartDate = this._getSavedStartDate();
    }
  }
  _getSavedStartDate() {
    this.hruData.sort((a: any, b: any) => {
      // @ts-ignore
      return new Date(a.due_date) - new Date(b.due_date);
    });

    return this.hruData[0].start_date;
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  _empty(listLength: number) {
    return listLength === 0 || !listLength;
  }

  _addToList() {
    if (!this.selectedDate) {
      fireEvent(this, 'toast', {
        text: getTranslation('PLEASE_SELECT_DATE'),
        showCloseBtn: true
      });
      return;
    }
    const alreadySelected = this.hruData.find((d: any) => d.end_date === this.selectedDate);
    if (alreadySelected) {
      fireEvent(this, 'toast', {
        text: getTranslation('DATE_ALREADY_ADDED'),
        showCloseBtn: true
      });
      return;
    }
    const auxHruData = [...this.hruData];
    auxHruData.push({
      end_date: dayjs(this.selectedDate).format('YYYY-MM-DD'),
      due_date: this._oneDayAfterEndDate(this.selectedDate)
    });
    this.hruData = [...auxHruData];
  }

  _oneDayAfterEndDate(endDt: string) {
    return dayjs(endDt).add(1, 'days').format('YYYY-MM-DD');
  }

  _deleteHruDate(e: CustomEvent) {
    const auxHruData = this.hruData;
    auxHruData.splice(e.detail.index, 1);
    this.hruData = [...auxHruData];
  }

  _hideEditedIndexInfo(index: number) {
    return index === -1;
  }

  updateStartDates(startDate: any) {
    if (isEmptyObject(this.hruData)) {
      return;
    }
    this.hruData[0].start_date = startDate;

    this._calculateStartDateForTheRestOfItems();
  }

  _calculateStartDateForTheRestOfItems() {
    let i;
    for (i = 1; i < this.hruData.length; i++) {
      this.hruData[i].start_date = this._computeStartDate(i);
    }
  }

  _computeStartDate(i: number) {
    return dayjs(this.hruData[i - 1].end_date)
      .add(1, 'days')
      .format('YYYY-MM-DD');
  }

  _saveHurData() {
    this.updateStartDates(this.repStartDate);
    const endpoint = getEndpoint(interventionEndpoints.reportingRequirements, {
      intervId: this.interventionId,
      reportType: CONSTANTS.REQUIREMENTS_REPORT_TYPE.HR
    });
    const dialog = this.shadowRoot!.querySelector(`#editHruDialog`) as EtoolsDialog;
    dialog.startSpinner();
    sendRequest({
      method: 'POST',
      endpoint: endpoint,
      body: {reporting_requirements: this.hruData}
    })
      .then((response: any) => {
        dialog.stopSpinner();
        fireEvent(this, 'dialog-closed', {confirmed: true, response: response.reporting_requirements});
      })
      .catch((error: any) => {
        logError('Failed to save/update HR data!', 'edit-hru-dialog', error);
        parseRequestErrorsAndShowAsToastMsgs(error, this);
        dialog.stopSpinner();
      });
  }

  changed(value: string) {
    this.selectedDate = dayjs(new Date(value)).format('YYYY-MM-DD');
  }
}
