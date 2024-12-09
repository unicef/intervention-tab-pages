import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {prepareDatepickerDate} from '@unicef-polymer/etools-utils/dist/date.util';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-date-time/calendar-lite';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import EtoolsDialog from '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {AnyObject, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import dayjs from 'dayjs';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 */
@customElement('add-edit-special-rep-req')
export class AddEditSpecialRepReq extends LitElement {
  static get styles() {
    return [layoutStyles];
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
        etools-input {
          width: 100%;
        }
        label {
          margin-bottom: 24px;
          font-size: var(--etools-font-size-14, 14px);
        }
        calendar-lite {
          position: relative;
        }
        .mt-24 {
          margin-top: 24px;
        }
      </style>

      <etools-dialog
        id="addEditDialog"
        size="lg"
        dialog-title=${translate('ADD_EDIT_SPECIAL_REPORTING_REQUIREMENTS')}
        @confirm-btn-clicked="${this._save}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        @close="${() => this._onClose()}"
        keep-dialog-open
      >
        <div class="row">
          <div class="col-12 layout-vertical">
            <label for="startDate">${translate('REPORT_DUE_DATE')}</label>
            <calendar-lite
              id="startDate"
              pretty-date="${this.item.due_date ? this.item.due_date : ''}"
              .date="${this.item.due_date}"
              format="YYYY-MM-DD"
              @date-changed="${({detail}: CustomEvent) =>
                (this.item.due_date = dayjs(new Date(detail.value)).format('YYYY-MM-DD'))}"
              hide-header
            ></calendar-lite>
          </div>
          <div class="col-12 mt-24">
            <etools-input
              label=${translate('REPORTING_REQUIREMENT')}
              placeholder="&#8212;"
              value="${this.item.description ? this.item.description : ''}"
              @value-changed="${({detail}: CustomEvent) => (this.item.description = detail.value)}"
            >
            </etools-input>
          </div>
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
      return getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.specialReportingRequirements, {
        intervId: this.interventionId
      });
    } else {
      // already saved... update/delete
      return getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.specialReportingRequirementsUpdate, {
        reportId: this.item.id
      });
    }
  }

  _save() {
    const dialog = this.shadowRoot!.querySelector(`#addEditDialog`) as unknown as EtoolsDialog;
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
        EtoolsLogger.error('Failed to save/update special report requirement!', 'add-edit-special-rep-req', error);
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
