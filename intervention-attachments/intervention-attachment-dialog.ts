import {LitElement, html, TemplateResult, property, customElement, CSSResultArray, css} from 'lit-element';
import {fireEvent} from '../utils/fire-custom-event';
import {getEndpoint} from '../utils/endpoint-helper';
import {interventionEndpoints} from '../utils/intervention-endpoints';
import {ReviewAttachment} from '../common/models/intervention.types';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import '@unicef-polymer/etools-upload/etools-upload.js';
import '@polymer/paper-checkbox';
import '@unicef-polymer/etools-dialog';
import {GenericObject, IdAndName} from '../common/models/globals.types';
import {getStore} from '../utils/redux-store-access';
import {updateCurrentIntervention} from '../common/actions';
import {connect} from 'pwa-helpers/connect-mixin';
import {validateRequiredFields} from '../utils/validation-helper';
import {sharedStyles} from '../common/styles/shared-styles-lit';

@customElement('intervention-attachment-dialog')
export class InterventionAttachmentDialog extends connect(getStore())(LitElement) {
  static get styles(): CSSResultArray {
    // language=css
    return [
      css`
        .container {
          padding: 24px;
        }
        etools-dropdown {
          width: 50%;
        }
        etools-upload {
          margin-top: 14px;
        }
        etools-form-element-wrapper {
          display: block;
          margin-top: 18px;
        }
      `
    ];
  }
  @property() dialogOpened = true;
  @property() savingInProcess = false;
  @property() data: Partial<ReviewAttachment> = {};

  protected selectedFileId: number | null = null;
  private interventionId!: number;
  private fileTypes: IdAndName[] = [];
  private errors: GenericObject<any> = {};

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {attachment} = data;
    this.data = attachment ? {...attachment} : {active: true};
  }

  protected render(): TemplateResult {
    return html`
      <style>
        ${sharedStyles} etools-dialog {
          --etools-dialog-scrollable: {
            margin-top: 0 !important;
          }
          --etools-dialog-button-styles: {
            margin-top: 0;
          }
        }
      </style>
      <etools-dialog
        size="md"
        keep-dialog-open
        ?opened="${this.dialogOpened}"
        dialog-title="Attachment"
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        .okBtnText="Save"
        no-padding
      >
        <etools-loading ?active="${this.savingInProcess}"></etools-loading>
        <div class="container">
          <!-- Document Type -->
          <etools-dropdown
            class="validate-input flex-1"
            @etools-selected-item-changed="${({detail}: CustomEvent) =>
              this.updateField('type', detail.selectedItem && detail.selectedItem.id)}"
            ?trigger-value-change-event="${!this.savingInProcess}"
            .selected="${this.data?.type}"
            label="Document Type"
            placeholder="Select Document Type"
            .options="${this.fileTypes}"
            option-label="name"
            option-value="id"
            allow-outside-scroll
            dynamic-align
            required
            ?invalid="${this.errors.type}"
            .errorMessage="${(this.errors.type && this.errors.type[0]) || 'This field is required'}"
            @focus="${() => this.resetFieldError('type')}"
            @tap="${() => this.resetFieldError('type')}"
          ></etools-dropdown>

          <!-- Attachment -->
          <etools-upload
            label="Attachment"
            accept=".doc,.docx,.pdf,.jpg,.png"
            .showDeleteBtn="${false}"
            ?readonly="${this.data.id}"
            required
            .fileUrl="${this.data && (this.data.attachment || this.data.attachment_document)}"
            .uploadEndpoint="${interventionEndpoints.attachmentsUpload.url!}"
            @upload-finished="${(event: CustomEvent) => this.fileSelected(event.detail)}"
            ?invalid="${this.errors.attachment_document}"
            .errorMessage="${this.errors.attachment_document && this.errors.attachment_document[0]}"
            @focus="${() => this.resetFieldError('attachment_document')}"
            @tap="${() => this.resetFieldError('attachment_document')}"
          ></etools-upload>

          <etools-form-element-wrapper no-placeholder>
            <paper-checkbox
              ?checked="${!this.data?.active}"
              @checked-changed="${(e: CustomEvent) => this.updateField('active', !e.detail.value)}"
            >
              Invalid
            </paper-checkbox>
          </etools-form-element-wrapper>
        </div>
      </etools-dialog>
    `;
  }

  stateChanged(state: any): void {
    this.interventionId = state.interventions?.current.id;
    this.fileTypes = state.commonData.fileTypes || [];
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  updateField(field: keyof ReviewAttachment, value: any): void {
    this.data[field] = value;
  }

  resetFieldError(field: string): void {
    delete this.errors[field];
    this.performUpdate();
  }

  protected fileSelected({success}: {success?: any; error?: string}): void {
    if (success) {
      this.selectedFileId = success.id || null;
    }
  }

  processRequest(): void {
    if (this.savingInProcess) {
      return;
    }
    if (!validateRequiredFields(this)) {
      return;
    }
    this.savingInProcess = true;
    const {id, active, type} = this.data;
    const body = id
      ? {
          id,
          active,
          type
        }
      : {
          attachment_document: this.selectedFileId,
          active,
          type
        };
    const endpoint = id
      ? getEndpoint(interventionEndpoints.updatePdAttachment, {id: this.interventionId, attachment_id: id})
      : getEndpoint(interventionEndpoints.pdAttachments, {id: this.interventionId});
    sendRequest({
      endpoint,
      method: id ? 'PATCH' : 'POST',
      body
    })
      .then(({intervention}: any) => {
        getStore().dispatch(updateCurrentIntervention(intervention));
        this.onClose();
      })
      .catch((error: any) => {
        this.errors = error.response;
      })
      .finally(() => {
        this.savingInProcess = false;
      });
  }
}
