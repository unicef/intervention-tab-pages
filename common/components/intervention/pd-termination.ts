import {LitElement, html, customElement, property} from 'lit-element';
import EnvironmentFlagsMixin from '../../../common/mixins/environment-flags-mixin';
import ComponentBaseMixin from '../../../common/mixins/component-base-mixin';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-upload/etools-upload';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '../../../common/layout/etools-warn-message';
import '../../styles/shared-styles-lit';
import {sharedStyles} from '../../styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../styles/grid-layout-styles-lit';
import {requiredFieldStarredStylesPolymer} from '../../styles/required-field-styles';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../../utils/redux-store-access';
import {formatDate} from '../../../utils/date-utils';
import {patchIntervention} from '../../actions';
import {getEndpoint} from '../../../../../../../endpoints/endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {fireEvent} from '../../../../../../utils/fire-custom-event';
declare const moment: any;

/**
 * @LitElement
 * @customElement
 * @appliesMixin EnvironmentFlagsMixin
 */
@customElement('pd-termination')
export class PdTermination extends connect(getStore())(ComponentBaseMixin(EnvironmentFlagsMixin(LitElement))) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      <style>
        ${sharedStyles}${requiredFieldStarredStylesPolymer}:host {
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
        ?opened="${this.dialogOpened}"
        size="md"
        ?hidden="${this.warningOpened}"
        ok-btn-text="Terminate"
        dialog-title="Terminate PD/SSFA"
        @close="${this._handleDialogClosed}"
        @confirm-btn-clicked="${this._triggerPdTermination}"
        ?disable-confirm-btn="${this.uploadInProgress}"
        ?disable-dismiss-btn="${this.uploadInProgress}"
      >
        <div class="row-h flex-c">
          <datepicker-lite
            id="terminationDate"
            label="Termination Date"
            .value="${this.termination.date}"
            max-date="${this._getMaxDate()}"
            error-message="Please select termination date"
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
            label="Termination Notice"
            accept=".doc,.docx,.pdf,.jpg,.png"
            .fileUrl="${this.termination.attachment_notice}"
            .uploadEndpoint="${this.uploadEndpoint}"
            @upload-finished="${this._uploadFinished}"
            required
            .uploadInProgress="${this.uploadInProgress}"
            error-message="Termination Notice file is required"
          >
        </div>
        <div class="row-h flex-c">
          <etools-warn-message
            .messages="Once you hit save, the PD/SSFA will be Terminated and this action can not be reversed"
          >
          </etools-warn-message>
          Once you hit save, the PD/SSFA will be Terminated and this action can not be reversed
        </div>
      </etools-dialog>

      <etools-dialog
        no-padding
        id="pdTerminationConfirmation"
        theme="confirmation"
        ?opened="${this.warningOpened}"
        size="md"
        ok-btn-text="Continue"
        @close="${this._terminationConfirmed}"
      >
        <div class="row-h">
          Please make sure that the reporting requirements for the PD are updated with the correct dates
        </div>
      </etools-dialog>
    `;
  }

  @property({type: String})
  uploadEndpoint: string | undefined = interventionEndpoints.attachmentsUpload.url;

  @property({type: Number})
  interventionId!: number;

  @property({type: Boolean})
  opened!: boolean;

  @property({type: Boolean})
  warningOpened!: boolean;

  @property({type: Object})
  termination!: {date: string; attachment_notice: number};

  @property({type: Object})
  terminationElSource!: LitElement;

  @property({type: Boolean})
  uploadInProgress = false;

  @property({type: Boolean, reflect: true})
  dialogOpened!: boolean;

  private _validationSelectors: string[] = ['#terminationDate', '#terminationNotice'];

  _getMaxDate() {
    return moment(Date.now()).add(30, 'd').toDate();
  }

  _handleDialogClosed() {
    this.resetValidations();
  }

  _triggerPdTermination() {
    if (!this.validate()) {
      return;
    }
    if (this.environmentFlags && !this.environmentFlags.prp_mode_off && this.environmentFlags.prp_server_on) {
      this.warningOpened = true;
    } else {
      this._terminatePD();
    }
  }

  _terminationConfirmed(e: CustomEvent) {
    if (e.detail.confirmed) {
      this._terminatePD();
    }
  }

  _terminatePD() {
    if (this.validate()) {
      const body = {
        id: this.interventionId,
        end: this.termination.date,
        termination_doc_attachment: this.termination.attachment_notice
      };

      const endpoint = getEndpoint(interventionEndpoints.interventionAction, {
        interventionId: this.interventionId,
        action: 'terminate'
      });
      fireEvent(this, 'global-loading', {
        active: true,
        loadingSource: 'intervention-actions'
      });
      sendRequest({
        endpoint,
        body,
        method: 'PATCH'
      })
        .then(() => {
          // TODO: update intervention in redux
        })
        .catch((e) => {
          console.log(e);
          fireEvent(this, 'toast', {text: 'Can not update intervention'});
        })
        .finally(() => {
          fireEvent(this, 'global-loading', {
            active: false,
            loadingSource: 'intervention-actions'
          });
        });
    }
  }

  // TODO: refactor validation at some point (common with ag add amendment dialog and more)
  resetValidations() {
    this._validationSelectors.forEach((selector: string) => {
      const el = this.shadowRoot!.querySelector(selector) as HTMLElement & {invalid: boolean};
      if (el) {
        el.invalid = false;
      }
    });
  }

  // TODO: refactor validation at some point (common with ag add amendment dialog and more)
  validate() {
    let isValid = true;
    this._validationSelectors.forEach((selector: string) => {
      const el = this.shadowRoot!.querySelector(selector) as LitElement & {
        validate(): boolean;
      };
      if (el && !el.validate()) {
        isValid = false;
      }
    });
    return isValid;
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
}
