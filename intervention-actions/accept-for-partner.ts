import {customElement, html, LitElement, property} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {fireEvent} from '../../../common/utils/fire-custom-event';
import {translate} from 'lit-translate';
import {sharedStyles} from '../../../common/styles/shared-styles-lit';

@customElement('accept-for-partner')
export class AcceptForPartner extends LitElement {
  render() {
    return html` <style>
        ${sharedStyles} .container {
          padding: 15px 20px;
        }
      </style>
      <etools-dialog
        id="dialog"
        size="md"
        no-padding
        keep-dialog-open
        opened
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
            @date-has-changed="${(e: CustomEvent) => (this.submission_date = e.detail.date)}"
            selected-date-display-format="D MMM YYYY"
          >
          </datepicker-lite>
        </div>
      </etools-dialog>`;
  }

  @property({type: String})
  submission_date!: string;

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
