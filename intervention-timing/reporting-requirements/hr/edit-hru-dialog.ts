/* eslint-disable lit/no-legacy-template-syntax */
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-button/paper-button.js';
declare const moment: any;
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-date-time/calendar-lite';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import './hru-list.js';
import CONSTANTS from '../../../common/constants';
import {fireEvent} from '../../../utils/fire-custom-event';
import {gridLayoutStylesPolymer} from '../../../common/styles/grid-layout-styles-polymer';
import {buttonsStylesPolymer} from '../styles/buttons-styles-polymer';
import {requiredFieldStarredStyles} from '../../../common/styles/required-field-styles';
import {prepareDatepickerDate, convertDate} from '../../../utils/date-utils';
// this was refactored
// import EndpointsMixin from '../mixins/endpoints-mixin';
import {getEndpoint} from '../../../utils/endpoint-helper';
import {connect} from 'pwa-helpers/connect-mixin';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {property} from '@polymer/decorators';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {AnyObject} from '../../../common/models/globals.types.js';
import {isEmptyObject} from '../../../utils/utils.js';
import {getStore} from '../../../utils/redux-store-access.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class EditHruDialog extends connect(getStore())(PolymerElement) {
  static get template() {
    return html`
      ${requiredFieldStarredStyles}${gridLayoutStylesPolymer()}${buttonsStylesPolymer()}
      <style include="data-table-styles">
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
      </style>

      <etools-dialog
        id="editHruDialog"
        size="lg"
        dialog-title="Add/Edit Dates for Humanitarian Report - UNICEF"
        on-confirm-btn-clicked="_saveHurData"
        ok-btn-text="Save"
        keep-dialog-open
        hidden$="[[datePickerOpen]]"
        spinner-text="Saving..."
      >
        <div class="start-date">
          <datepicker-lite
            id="dtPickerStDate"
            label="Select start date"
            value="{{repStartDate}}"
            required
            min-date="[[minDate]]"
            auto-validate
            open="{{datePickerOpen}}"
            selected-date-display-format="D MMM YYYY"
          >
          </datepicker-lite>
        </div>
        <div>
          Use the date picker to select end dates of humanitarian report requirements.
        </div>

        <div class="layout-horizontal row-padding-v">
          <div class="col layout-vertical col-6">
            <calendar-lite
              id="datepicker"
              date="[[prepareDatepickerDate(selectedDate)]]"
              pretty-date="{{selectedDate}}"
              format="YYYY-MM-DD"
              hide-header
            >
            </calendar-lite>

            <paper-button id="add-selected-date" class="secondary-btn" on-click="_addToList">
              Add Selected Date to List
            </paper-button>
          </div>
          <div class="col col-6">
            <div class="row-h" hidden$="[[!_empty(hruData.length)]]">
              No dates added.
            </div>
            <hru-list
              id="hruList"
              class="flex-c"
              with-scroll
              hru-data="[[hruData]]"
              hidden$="[[_empty(hruData.length)]]"
              edit-mode
              in-amendment="[[inAmendment]]"
              on-delete-hru="_deleteHruDate"
            >
            </hru-list>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Number})
  interventionId!: number;

  @property({type: Date})
  interventionStart!: Date | string;

  @property({type: Boolean})
  inAmendment!: boolean;

  @property({type: Date})
  repStartDate!: Date | string;

  @property({type: Date})
  minDate!: Date;

  @property({type: String})
  selectedDate!: string;

  @property({type: Array})
  hruData: AnyObject[] = [];

  @property({type: Object})
  toastMsgLoadingSource!: PolymerElement;

  @property({type: Number})
  _hruEditedIndex = -1;

  @property({type: Boolean})
  datePickerOpen = false;

  static get observers() {
    return ['intervDataChanged(interventionStart, interventionId)'];
  }

  stateChanged(_state: any) {
    // @lajos in ammendment will be used!
    this.inAmendment = false;
    // original:
    // this.inAmendment = state.pageData!.in_amendment;
  }

  intervDataChanged() {
    this.minDate = this._getMinDate();
  }

  _getMinDate() {
    if (!this.interventionStart) {
      return null;
    }
    const stDt = this.interventionStart instanceof Date ? this.interventionStart : convertDate(this.interventionStart);
    if (stDt) {
      return moment(stDt).add(-1, 'days').toDate();
    }
    return null;
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

  openDialog() {
    this._setDefaultStartDate();
    (this.$.editHruDialog as EtoolsDialog).opened = true;
  }

  closeDialog() {
    (this.$.editHruDialog as EtoolsDialog).opened = false;
  }

  _empty(listLength: number) {
    return listLength === 0 || !listLength;
  }

  _addToList() {
    const alreadySelected = this.hruData.find((d: any) => d.end_date === this.selectedDate);
    if (alreadySelected) {
      fireEvent(this.toastMsgLoadingSource, 'toast', {
        text: 'This date is already added to the list.',
        showCloseBtn: true
      });
      return;
    }
    this.push('hruData', {
      end_date: moment(this.selectedDate).format('YYYY-MM-DD'),
      due_date: this._oneDayAfterEndDate(this.selectedDate)
    });
  }

  _oneDayAfterEndDate(endDt: string) {
    return moment(endDt).add(1, 'days').format('YYYY-MM-DD');
  }

  _deleteHruDate(e: CustomEvent) {
    this.splice('hruData', e.detail.index, 1);
  }

  _hideEditedIndexInfo(index: number) {
    return index === -1;
  }

  updateStartDates(startDate: any) {
    if (isEmptyObject(this.hruData)) {
      return;
    }

    this.set('hruData.0.start_date', startDate);

    this._calculateStartDateForTheRestOfItems();
  }

  _calculateStartDateForTheRestOfItems() {
    let i;
    for (i = 1; i < this.hruData.length; i++) {
      this.set('hruData.' + i + '.start_date', this._computeStartDate(i));
    }
  }

  _computeStartDate(i: number) {
    return moment(this.hruData[i - 1].end_date)
      .add(1, 'days')
      .format('YYYY-MM-DD');
  }

  _saveHurData() {
    this.updateStartDates(this.repStartDate);
    // @lajos TO BE REFACTORED and checked
    const endpoint = getEndpoint(interventionEndpoints.reportingRequirements, {
      intervId: this.interventionId,
      reportType: CONSTANTS.REQUIREMENTS_REPORT_TYPE.HR
    });
    const dialog = this.$.editHruDialog as EtoolsDialog;
    dialog.startSpinner();
    sendRequest({
      method: 'POST',
      endpoint: endpoint,
      body: {reporting_requirements: this.hruData}
    })
      .then((response: any) => {
        fireEvent(this, 'reporting-requirements-saved', response.reporting_requirements);
        dialog.stopSpinner();
        this.closeDialog();
      })
      .catch((error: any) => {
        logError('Failed to save/update HR data!', 'edit-hru-dialog', error);
        parseRequestErrorsAndShowAsToastMsgs(error, this.toastMsgLoadingSource);
        dialog.stopSpinner();
      });
  }

  prepareDatepickerDate(dateStr: string) {
    return prepareDatepickerDate(dateStr);
  }
}

window.customElements.define('edit-hru-dialog', EditHruDialog);

export {EditHruDialog};
