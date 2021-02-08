import {customElement, html, LitElement, property, TemplateResult} from 'lit-element';
import {fireEvent} from '../utils/fire-custom-event';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-dialog/etools-dialog';
import { sharedStyles } from "../common/styles/shared-styles-lit";

@customElement('reason-popup')
export class ReasonPopup extends LitElement {
  @property() protected dialogOpened = true;
  @property() protected popupTitle = '';
  @property() protected label = '';
  @property() protected reason = '';
  @property() protected error = '';

  set dialogData({popupTitle, label}: any) {
    this.popupTitle = popupTitle;
    this.label = label;
  }

  render(): TemplateResult | void {
    return html`
      <style>
        ${sharedStyles}
        .container {
          padding: 15px 20px;
        }
        paper-textarea {
          outline: none;
          --paper-input-container-input: {
            display: block;
          }
        }

        etools-dialog::part(ed-scrollable) {
          margin-top: 0 !important;
        }
      </style>
      <etools-dialog
        id="dialog"
        size="md"
        no-padding
        keep-dialog-open
        ?opened="${this.dialogOpened}"
        .okBtnText="Confirm"
        dialog-title="${this.popupTitle}"
        @close="${this.onClose}"
        @confirm-btn-clicked="${() => this.confirmReason()}"
      >
        <div class="container">
          <paper-textarea
            id="details-input"
            .value="${this.reason}"
            required
            label="${this.label}"
            placeholder="—"
            @value-changed="${({detail}: CustomEvent) => (this.reason = detail.value)}"
            @focus="${() => (this.error = '')}"
            ?invalid="${Boolean(this.error)}"
            error-message="${this.error}"
            max-rows="3"
          ></paper-textarea>
        </div>
      </etools-dialog>
    `;
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  confirmReason(): void {
    if (!this.reason.trim()) {
      this.error = 'Field is required';
      return;
    }
    fireEvent(this, 'dialog-closed', {confirmed: true, response: {comment: this.reason}});
  }
}
