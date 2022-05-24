import {LitElement, html, TemplateResult, property, customElement, CSSResultArray, css} from 'lit-element';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import '@unicef-polymer/etools-upload/etools-upload.js';
import '@polymer/paper-checkbox';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {updateCurrentIntervention} from '../../common/actions/interventions';
import {
  validateRequiredFields,
  resetRequiredFields
} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {IdAndName, GenericObject, ReviewAttachment} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

@customElement('intervention-attachment-dialog')
export class InterventionAttachmentDialog extends connectStore(LitElement) {
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
        paper-checkbox {
          display: block;
          margin-top: 18px;
        }
      `
    ];
  }
  @property() dialogOpened = true;
  @property() savingInProcess = false;
  @property() data: Partial<ReviewAttachment> = {};

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
      ${sharedStyles}
      <style>
        etools-dialog::part(ed-scrollable) {
          margin-top: 0 !important;
        }

        etools-dialog::part(ed-button-styles) {
          margin-top: 0;
        }
      </style>
      <etools-dialog
        size="md"
        keep-dialog-open
        ?opened="${this.dialogOpened}"
        dialog-title=${translate('ATTACHMENT')}
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
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
            label=${translate('SELECT_DOC_TYPE')}
            placeholder="—"
            .options="${this.fileTypes}"
            option-label="name"
            option-value="id"
            allow-outside-scroll
            dynamic-align
            required
            ?invalid="${this.errors.type}"
            .errorMessage="${(this.errors.type && this.errors.type[0]) || translate('GENERAL.REQUIRED_FIELD')}"
            @focus="${() => this.resetFieldError('type', this)}"
            @click="${() => this.resetFieldError('type', this)}"
          ></etools-dropdown>

          <!-- Attachment -->
          <etools-upload
            label=${translate('ATTACHMENT')}
            accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.txt,.xml,.xls,.xlt,.xlsx,.xlsm,.xlsb,.xltx,.xltm"
            .showDeleteBtn="${false}"
            ?readonly="${this.data.id}"
            required
            .fileUrl="${this.data && (this.data.attachment || this.data.attachment_document)}"
            .uploadEndpoint="${interventionEndpoints.attachmentsUpload.url!}"
            @upload-finished="${(event: CustomEvent) => this.fileSelected(event.detail)}"
            ?invalid="${this.errors.attachment_document}"
            .errorMessage="${this.errors.attachment_document && this.errors.attachment_document[0]}"
            @focus="${() => this.resetFieldError('attachment_document', this)}"
            @click="${() => this.resetFieldError('attachment_document', this)}"
          ></etools-upload>

          <paper-checkbox
            ?checked="${!this.data?.active}"
            @checked-changed="${(e: CustomEvent) => this.updateField('active', !e.detail.value)}"
          >
            ${translate('INVALID')}
          </paper-checkbox>
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

  resetFieldError(field: string, el: any): void {
    delete this.errors[field];
    resetRequiredFields(el);
    this.performUpdate();
  }

  protected fileSelected({success}: {success?: any; error?: string}): void {
    if (success) {
      this.data.attachment_document = success.id || null;
      this.data = {...this.data};
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
          attachment_document: this.data.attachment_document,
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
