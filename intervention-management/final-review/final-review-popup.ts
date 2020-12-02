import {LitElement, html, TemplateResult, customElement, property} from 'lit-element';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '../../utils/fire-custom-event';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import '@unicef-polymer/etools-upload/etools-upload';
import {getStore} from '../../utils/redux-store-access';
import {updateCurrentIntervention} from '../../common/actions/interventions';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {ReviewAttachment, Intervention} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {formatDate} from '../../utils/date-utils';

@customElement('final-review-popup')
export class FinalReviewPopup extends LitElement {
  @property() savingInProcess = false;
  @property() dialogOpened = true;
  @property() data = {} as Partial<ReviewAttachment>;
  @property() date = null;
  private endpoint!: EtoolsRequestEndpoint;

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {attachment, interventionId} = data;
    this.endpoint = getEndpoint(interventionEndpoints.intervention, {interventionId});
    this.data = attachment ? {...attachment} : {attachment: null};
    this.date = data.date || null;
  }

  protected render(): TemplateResult {
    return html`
      <style>
        .control-container {
          padding: 0 24px;
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
        dialog-title=${translate('INTERVENTION_MANAGEMENT.FINAL_REVIEW.FINAL_REVIEW_POP.FINAL_PARTNERSHIP_REV_ATT')}
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        .okBtnText=${translate('GENERAL.SAVE')}
        no-padding
      >
        <div class="container layout vertical">
          <div class="control-container">
            <!-- Document Submission Date -->
            <datepicker-lite
              id="submissionDateField"
              label=${translate('INTERVENTION_MANAGEMENT.FINAL_REVIEW.DATE_REVIEW_PERFORMED')}
              .value="${this.date}"
              selected-date-display-format="D MMM YYYY"
              required
              fire-date-has-changed
              @date-has-changed="${(e: CustomEvent) => (this.date = formatDate(e.detail.date, 'YYYY-MM-DD'))}"
              error-message=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.DOC_DATE_REQUIRED')}
            >

          </div>
          <div class="control-container">
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
      this.data.id = success.id || null;
    }
  }

  processRequest(): void {
    // validate if file is selected for new attachments
    if (!this.data.id) {
      fireEvent(this, 'toast', {
        text: (translate(
          'INTERVENTION_MANAGEMENT.FINAL_REVIEW.FINAL_REVIEW_POP.CORRECT_FILE_ERR'
        ) as unknown) as string,
        showCloseBtn: false
      });
      return;
    } else if (!this.date) {
      fireEvent(this, 'toast', {
        text: (translate('INTERVENTION_MANAGEMENT.FINAL_REVIEW.FINAL_REVIEW_POP.DATE_REQUIRED') as unknown) as string,
        showCloseBtn: false
      });
      return;
    }

    this.savingInProcess = true;

    sendRequest({
      endpoint: this.endpoint,
      body: {
        final_partnership_review: this.data.id,
        date_partnership_review_performed: this.date
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
