import {LitElement, html, TemplateResult, customElement, property} from 'lit-element';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '../../utils/fire-custom-event';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import '@unicef-polymer/etools-upload/etools-upload';
import {getStore} from '../../utils/redux-store-access';
import {updateCurrentIntervention} from '../../common/actions';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {ReviewAttachment, Intervention} from '@unicef-polymer/etools-types';

@customElement('final-review-popup')
export class FinalReviewPopup extends LitElement {
  @property() savingInProcess = false;
  @property() dialogOpened = true;
  @property() data = {} as Partial<ReviewAttachment>;
  private endpoint!: EtoolsRequestEndpoint;

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {attachment, interventionId} = data;
    this.endpoint = getEndpoint(interventionEndpoints.intervention, {interventionId});
    this.data = attachment ? {...attachment} : {attachment: null};
  }

  protected render(): TemplateResult {
    return html`
      <style>
        .file-upload-container {
          padding: 0 12px;
        }
        etools-dialog {
          --etools-dialog-scrollable: {
            margin-top: 0 !important;
          }
        }
      </style>

      <etools-dialog
        size="md"
        keep-dialog-open
        ?opened="${this.dialogOpened}"
        ?show-spinner="${this.savingInProcess}"
        dialog-title="Final Partnership Review Attachment"
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        .okBtnText="Save"
        no-padding
      >
        <div class="container layout vertical">
          <div class="file-upload-container">
            <etools-upload
              .showDeleteBtn="${false}"
              .fileUrl="${this.data && this.data.attachment}"
              .uploadEndpoint="${getEndpoint(interventionEndpoints.attachmentsUpload).url}"
              @upload-finished="${(event: CustomEvent) => this.fileSelected(event.detail)}"
            ></etools-upload>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  protected fileSelected({success}: {success?: any; error?: string}): void {
    if (success) {
      this.data.attachment = success.id || null;
    }
  }

  processRequest(): void {
    // validate if file is selected for new attachments
    if (!this.data.attachment) {
      fireEvent(this, 'toast', {
        text: 'Please, select correct file',
        showCloseBtn: false
      });
      return;
    }

    this.savingInProcess = true;

    sendRequest({
      endpoint: this.endpoint,
      body: {
        final_partnership_review: this.data.attachment
      },
      method: 'PATCH'
    })
      .then((intervention: Intervention) => {
        getStore().dispatch(updateCurrentIntervention(intervention));
        this.onClose();
      })
      .finally(() => {
        this.savingInProcess = false;
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
      });
  }

  protected onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
