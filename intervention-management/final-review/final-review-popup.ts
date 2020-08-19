import {LitElement, html, TemplateResult, customElement, property} from 'lit-element';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '../../utils/fire-custom-event';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {Intervention, ReviewAttachment} from '../../common/models/intervention.types';
import '@unicef-polymer/etools-upload/etools-upload';
import {getStore} from '../../utils/redux-store-access';
import {updateCurrentIntervention} from '../../common/actions';

@customElement('final-review-popup')
export class FinalReviewPopup extends LitElement {
  @property() savingInProcess = false;
  @property() dialogOpened = true;
  @property() data: ReviewAttachment | null = null;
  protected selectedFileId: number | null = null;
  private endpoint!: EtoolsRequestEndpoint;

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {attachment, interventionId} = data;
    this.endpoint = getEndpoint(interventionEndpoints.intervention, {interventionId});
    this.data = attachment;
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
        dialog-title="Final Partnership Review Attachment"
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        .okBtnText="Save"
        no-padding
      >
        <etools-loading ?active="${this.savingInProcess}"></etools-loading>
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
      this.selectedFileId = success.id || null;
    }
  }

  processRequest(): void {
    // validate if file is selected for new attachments
    if (!this.data && !this.selectedFileId) {
      fireEvent(this, 'toast', {
        text: 'Please, select correct file',
        showCloseBtn: false
      });
      return;
    } else if (!this.selectedFileId && this.data) {
      this.onClose();
    }
    this.savingInProcess = true;

    sendRequest({
      endpoint: this.endpoint,
      body: {
        final_partnership_review: this.selectedFileId
      },
      method: 'PATCH'
    })
      .then((intervention: Intervention) => {
        getStore().dispatch(updateCurrentIntervention(intervention));
        this.onClose();
      })
      .finally(() => {
        this.savingInProcess = false;
      });
  }

  protected onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
