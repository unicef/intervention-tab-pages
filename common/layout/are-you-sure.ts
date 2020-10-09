import {html, LitElement, customElement, property} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog';
import {fireEvent} from '../../utils/fire-custom-event';

@customElement('are-you-sure')
export class AreYouSure extends LitElement {
  render() {
    return html` <style>
        .content {
          margin-top: 16px;
          padding-left: 24px;
        }
      </style>
      <etools-dialog
        id="infoDialog"
        size="md"
        no-padding
        opened
        theme="confirmation"
        .okBtnText="${this.confirmBtnText}"
        @close="${(e: CustomEvent) => this.handleDialogClosed(e)}"
        @confirm-btn-clicked="${(e: CustomEvent) => this.handleDialogClosed(e)}"
      >
        <div class="content">${this.content}</div>
      </etools-dialog>`;
  }

  @property({type: String})
  content = 'Are you sure you want to delete this item?';

  @property({type: String})
  confirmBtnText = 'OK';

  set dialogData({content, confirmBtnText}: any) {
    this.content = content;
    if (confirmBtnText) {
      this.confirmBtnText = confirmBtnText;
    }
  }

  handleDialogClosed(e: CustomEvent): void {
    fireEvent(this, 'dialog-closed', {confirmed: e.detail.confirmed});
  }
}
