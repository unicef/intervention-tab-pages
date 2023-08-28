import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {translate} from 'lit-translate';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {formatDate} from '@unicef-polymer/etools-utils/dist/date.util';

@customElement('accept-for-partner')
export class AcceptForPartner extends LitElement {
  render() {
    return html` ${sharedStyles}
      <style>
        .container {
          padding: 15px 20px;
        }
      </style>
      <etools-dialog
        id="dialog"
        size="md"
        no-padding
        keep-dialog-open
        .okBtnText="${translate('GENERAL.SAVE')}"
        dialog-title="${translate('ACCEPT_ON_BEHALF_OF_PARTNER')}"
        @close="${this.onClose}"
        @confirm-btn-clicked="${() => this.confirmDate()}"
      >
        <div class="container">
          <datepicker-lite
            id="submissionDt"
            .label="${translate('SUBMISSION_DATE')}"
            fire-date-has-changed
            required
            auto-validate
            @date-has-changed="${(e: CustomEvent) => this.dateHasChanged(e.detail)}"
            selected-date-display-format="D MMM YYYY"
          >
          </datepicker-lite>
        </div>
      </etools-dialog>`;
  }

  @property({type: String})
  submission_date!: string;

  dateHasChanged(detail: {date: Date}) {
    const newValue = detail.date ? formatDate(detail.date, 'YYYY-MM-DD') : null;
    this.submission_date = newValue;
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  confirmDate() {
    if (!this.shadowRoot?.querySelector<any>('#submissionDt').validate()) {
      return;
    }
    fireEvent(this, 'dialog-closed', {confirmed: true, response: {submission_date: this.submission_date}});
  }
}
