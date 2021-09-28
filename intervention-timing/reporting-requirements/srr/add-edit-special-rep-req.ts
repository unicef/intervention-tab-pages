/* eslint-disable lit/no-legacy-template-syntax */
import {LitElement, html, property, customElement} from 'lit-element';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {prepareDatepickerDate} from '@unicef-polymer/etools-modules-common/dist/utils/date-utils';

import '@polymer/iron-label/iron-label';
import '@polymer/paper-input/paper-input';
import '@unicef-polymer/etools-dialog/etools-dialog.js';

import '@unicef-polymer/etools-date-time/calendar-lite';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import {AnyObject} from '@unicef-polymer/etools-types';
declare const dayjs: any;
import {translate} from 'lit-translate';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 */
@customElement('add-edit-special-rep-req')
export class AddEditSpecialRepReq extends LitElement {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    if (!this.item) {
      return;
    }
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
        }

        paper-input {
          width: 100%;
        }

        iron-label {
          margin-bottom: 24px;
        }

        calendar-lite {
          position: relative;
        }
      </style>

      <etools-dialog
        id="addEditDialog"
        size="lg"
        opened
        dialog-title=${translate('ADD_EDIT_SPECIAL_REPORTING_REQUIREMENTS')}
        @confirm-btn-clicked="${this._save}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        @close="${() => this._onClose()}"
        keep-dialog-open
      >
        <div class="row-h">
          <div class="col layout-vertical col-5">
            <iron-label for="startDate">${translate('REPORT_DUE_DATE')}</iron-label>
            <calendar-lite
              id="startDate"
              pretty-date="${this.item.due_date ? this.item.due_date : ''}"
              format="YYYY-MM-DD"
              @date-changed="${({detail}: CustomEvent) =>
                (this.item.due_date = dayjs(new Date(detail.value)).format('YYYY-MM-DD'))}"
              hide-header
            ></calendar-lite>
          </div>
        </div>
        <div class="row-h">
          <paper-input
            label=${translate('REPORTING_REQUIREMENT')}
            placeholder="&#8212;"
            value="${this.item.description ? this.item.description : ''}"
            @value-changed="${({detail}: CustomEvent) => (this.item.description = detail.value)}"
          >
          </paper-input>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Number})
  interventionId!: number;

  @property({type: Object})
  item!: AnyObject;

  set dialogData(data: any) {
    const {item, interventionId}: any = data;
    this.item = item;
    this.interventionId = interventionId;
  }

  _isNew() {
    return !this.item.id;
  }

  _getEndpoint() {
    if (this._isNew()) {
      // new/create
      return getEndpoint(interventionEndpoints.specialReportingRequirements, {
        intervId: this.interventionId
      });
    } else {
      // already saved... update/delete
      return getEndpoint(interventionEndpoints.specialReportingRequirementsUpdate, {
        reportId: this.item.id
      });
    }
  }

  _save() {
    const dialog = this.shadowRoot!.querySelector(`#addEditDialog`) as EtoolsDialog;
    dialog.startSpinner();

    const endpoint = this._getEndpoint();
    const method = this._isNew() ? 'POST' : 'PATCH';
    sendRequest({
      method: method,
      endpoint: endpoint,
      body: this._getBody()
    })
      .then((response: any) => {
        dialog.stopSpinner();
        fireEvent(this, 'dialog-closed', {confirmed: true, response: response});
      })
      .catch((error: any) => {
        dialog.stopSpinner();
        logError('Failed to save/update special report requirement!', 'add-edit-special-rep-req', error);
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      });
  }

  _getBody() {
    return {
      due_date: this.item.due_date,
      description: this.item.description
    };
  }

  prepareDatepickerDate(dateStr: string) {
    const date = prepareDatepickerDate(dateStr);
    if (date === null) {
      const now = dayjs(new Date()).format('YYYY-MM-DD');
      return prepareDatepickerDate(now);
    } else {
      return date;
    }
    return prepareDatepickerDate(dateStr);
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
export {AddEditSpecialRepReq as AddEditSpecialRepReqEl};
