import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-upload';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-modules-common/dist/layout/etools-warn-message';
import '@unicef-polymer/etools-utils/dist/fire-event.util';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {formatDate} from '@unicef-polymer/etools-utils/dist/date.util';
import {validateRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import EnvironmentFlagsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/environment-flags-mixin';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {AnyObject} from '@unicef-polymer/etools-types';
import {get as getTranslation, translate} from 'lit-translate';
declare const dayjs: any;

/**
 * @LitElement
 * @customElement
 */
@customElement('pd-termination')
export class PdTermination extends ComponentBaseMixin(EnvironmentFlagsMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
      :host {
          /* host CSS */
        }
        #pdTermination {
          --etools-dialog-default-btn-bg: var(--error-color);
        }
        #pdTerminationConfirmation {
          --etools-dialog-confirm-btn-bg: var(--primary-color);
        }
      </style>
      <etools-dialog
        no-padding
        keep-dialog-open
        id="pdTermination"
        size="md"
        ?hidden="${this.warningOpened}"
        ok-btn-text="${translate('TERMINATE')}"
        dialog-title="${translate('TERMINATE_PD_SPD')}"
        @confirm-btn-clicked="${this._triggerPdTermination}"
        ?disable-confirm-btn="${this.uploadInProgress}"
        ?disable-dismiss-btn="${this.uploadInProgress}"
        ?show-spinner="${this.savingInProcess}"
      >
        <div class="row-h flex-c">
          <datepicker-lite
            id="terminationDate"
            label="${translate('TERMINATION_DATE')}"
            .value="${this.termination.date}"
            max-date="${this._getMaxDate()}"
            error-message="${translate('PLEASE_SELECT_TERMINATION_DATE')}"
            auto-validate
            required
            selected-date-display-format="D MMM YYYY"
            fire-date-has-changed
            @date-has-changed="${(e: CustomEvent) => this.updateDate(e.detail.date)}"
          >
          </datepicker-lite>
        </div>
        <div class="row-h flex-c">
          <etools-upload
            id="terminationNotice"
            label="${translate('TERMINATION_NOTICE')}"
            accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.txt"
            .fileUrl="${this.termination.attachment_notice}"
            .uploadEndpoint="${this.uploadEndpoint}"
            @upload-finished="${this._uploadFinished}"
            required
            .uploadInProgress="${this.uploadInProgress}"
            error-message="${translate('TERMINATION_NOTICE_FILE_IS_REQUIRED')}"
          >
        </div>
        <div class="row-h flex-c">
          <etools-warn-message-lit
            .messages="${this.warnMessages}"
          >
          </etools-warn-message-lit>

        </div>
      </etools-dialog>
    `;
  }

  @property({type: String})
  uploadEndpoint: string | undefined = interventionEndpoints.attachmentsUpload.url;

  @property({type: Number})
  interventionId!: number;

  @property({type: Boolean})
  warningOpened!: boolean;

  @property({type: Object})
  termination = {
    date: '',
    attachment_notice: 0
  };

  @property({type: Object})
  terminationElSource!: LitElement;

  @property({type: Boolean})
  uploadInProgress = false;

  @property()
  savingInProcess = false;

  set dialogData(data: AnyObject) {
    if (!data) {
      return;
    }
    const {interventionId} = data;
    this.interventionId = interventionId;
  }

  warnMessages: string[] = [getTranslation('ONCE_YOU_HIT_SAVE_THE_PD_WILL_BE_TERMINATED_AND_UNREVERSABLE')];

  _getMaxDate() {
    return dayjs(Date.now()).add(30, 'd').toDate();
  }

  validate() {
    return validateRequiredFields(this);
  }

  _uploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      this.termination.attachment_notice = uploadResponse.id;
      this.termination = {...this.termination};
    }
  }

  updateDate(terminationDate: Date) {
    this.termination.date = formatDate(terminationDate, 'YYYY-MM-DD');
    this.termination = {...this.termination};
  }

  _handleErrorResponse(error: any) {
    parseRequestErrorsAndShowAsToastMsgs(error, this);
  }

  _triggerPdTermination() {
    if (!this.validate()) {
      return;
    }
    this.envFlagsStateChanged(getStore().getState());
    if (this.environmentFlags && !this.environmentFlags.prp_mode_off && this.environmentFlags.prp_server_on) {
      openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          content: getTranslation('PLEASE_MAKE_SURE_THE_REPORTIN_REQ_ARE_UPDATED_WITH_THE_CORRECT_DATES'),
          confirmBtnText: getTranslation('TERMINATE')
        }
      }).then(({confirmed}) => {
        if (confirmed) {
          this.terminatePD();
        }
      });
    } else {
      this.terminatePD();
    }
    return;
  }

  terminatePD(): void {
    fireEvent(this, 'dialog-closed', {
      confirmed: true,
      response: {
        id: this.interventionId,
        end: this.termination.date,
        termination_doc_attachment: this.termination.attachment_notice
      }
    });
  }
}
