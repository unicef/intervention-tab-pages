import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-input/paper-input';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import '@unicef-polymer/etools-upload/etools-upload';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import '../../common/layout/etools-warn-message';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {formatDate} from '../../utils/date-utils';
import {requiredFieldStarredStyles} from '../../common/styles/required-field-styles';
import {validateRequiredFields, resetRequiredFields} from '../../utils/validation-helper';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {updateCurrentIntervention} from '../../common/actions';
import {InterventionAmendment} from '../../common/models/intervention.types';
import {LabelAndValue, AnyObject} from '../../common/models/globals.types';
import {isJsonStrMatch} from '../../utils/utils';
import CONSTANTS from '../../common/constants';

/**
 * @customElement
 */
@customElement('add-amendment-dialog')
export class AddAmendmentDialog extends connect(getStore())(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    return html`<style>
        ${sharedStyles} ${requiredFieldStarredStyles}
        paper-input#other {
          width: 100%;
        }
        .row-h {
          padding-top: 0 !important;
          padding-bottom: 16px;
          overflow: hidden !important;
        }
      </style>

      <etools-dialog
        no-padding
        keep-dialog-open
        id="add-amendment"
        size="md"
        ?opened="${this.dialogOpened}"
        ok-btn-text="Save"
        dialog-title="Add Amendment"
        @close="${() => this.handleDialogClose()}"
        @confirm-btn-clicked="${() => this._validateAndSaveAmendment()}"
        ?disable-confirm-btn="${this.uploadInProgress}"
        ?disable-dismiss-btn="${this.uploadInProgress}"
      >
        <div class="row-h flex-c">
          <!-- Signed Date -->
          <datepicker-lite
            id="signed-date"
            label="Signed date"
            .value="${this.data.signed_date}"
            max-date="${this.getCurrentDate()}"
            fire-date-has-changed
            @date-has-changed="${(e: CustomEvent) =>
              this.valueChanged({value: formatDate(e.detail.date, 'YYYY-MM-DD')}, 'signed_date')}"
            max-date-error-msg="Date can not be in the future"
            auto-validate
            required
            selected-date-display-format="D MMM YYYY"
          >
          </datepicker-lite>
        </div>
        <div class="row-h flex-c">
          <!-- Amendment Type -->
          <etools-dropdown-multi
            id="amendment-types"
            label="Amendment Types"
            placeholder="&#8212;"
            .options="${this.filteredAmendmentTypes}"
            .selectedValues="${this.data.types}"
            hide-search
            required
            option-label="label"
            option-value="value"
            error-message="Type is required"
            trigger-value-change-event
            @etools-selected-items-changed="${({detail}: CustomEvent) => {
              this.selectedItemsChanged(detail, 'types', 'value');
              this.onTypesChanged();
            }}"
          >
          </etools-dropdown-multi>
        </div>
        <div class="row-h flex-c" ?hidden="${!this.data.types || !this.data.types!.length}">
          <etools-warn-message .messages="${this.warnMessages}"></etools-warn-message>
        </div>
        </div>
        <div class="row-h" ?hidden="${!this.showOtherInput}">
          <paper-input
            id="other"
            placeholder="&#8212;"
            label="Other"
            invalid
            ?required="${this.showOtherInput}"
            auto-validate
            error-message="This is required"
            .value="${this.data.other_description}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'other_description')}"
          >
          </paper-input>
        </div>
        <div class="row-h flex-c">
          <!-- Signed Agreement -->
          <etools-upload
            id="signed-agreement-upload"
            label="Signed Amendment"
            accept=".doc,.docx,.pdf,.jpg,.png"
            .fileUrl="${this.data.signed_amendment_attachment}"
            .uploadEndpoint="${this.uploadEndpoint}"
            @upload-finished="${this._amendmentUploadFinished}"
            required
            auto-validate
            .uploadInProgress="${this.amdUploadInProgress}"
            error-message="Attachment required"
          >
          </etools-upload>
        </div>
        <div class="row-h flex-c">
          <etools-upload
            id="prc-review-upload"
            label="Internal / PRC Reviews"
            accept=".doc,.docx,.pdf,.jpg,.png"
            .fileUrl="${this.data.internal_prc_review}"
            .uploadEndpoint="${this.uploadEndpoint}"
            .uploadInProgress="${this.prcUploadInProgress}"
            @upload-finished="${this._prcReviewUploadFinished}"
          >
          </etools-upload>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Boolean, reflect: true})
  dialogOpened = false;

  @property({type: Object})
  toastEventSource!: LitElement;

  @property({type: Object})
  intervention!: AnyObject;

  @property({type: Array})
  amendmentTypes!: LabelAndValue[];

  @property({type: String})
  uploadEndpoint: string | undefined = getEndpoint(interventionEndpoints.attachmentsUpload).url;

  @property({type: Boolean})
  uploadInProgress = false;

  @property({type: Boolean})
  amdUploadInProgress = false;

  @property({type: Boolean})
  prcUploadInProgress = false;

  @property({type: Array})
  filteredAmendmentTypes!: LabelAndValue[];

  @property({type: Boolean})
  showOtherInput = false;

  @property({type: Array})
  warnMessages: string[] = [];

  stateChanged(state: any) {
    if (
      state.commonData.interventionAmendmentTypes &&
      !isJsonStrMatch(this.amendmentTypes, state.commonData!.interventionAmendmentTypes)
    ) {
      this.amendmentTypes = [...state.commonData!.interventionAmendmentTypes];
    }
  }

  getUploadInProgress(amdInProgress: boolean, prcInProgress: boolean) {
    return amdInProgress || prcInProgress;
  }

  startSpinner() {
    (this.shadowRoot!.querySelector('#add-amendment') as EtoolsDialog).startSpinner();
  }

  stopSpinner() {
    (this.shadowRoot!.querySelector('#add-amendment') as EtoolsDialog).stopSpinner();
  }

  _filterAmendmentTypes(amendmentTypes: AnyObject[], interventionDocumentType: string) {
    if (!amendmentTypes || !interventionDocumentType) {
      return;
    }
    if (interventionDocumentType === CONSTANTS.DOCUMENT_TYPES.SSFA) {
      this.filteredAmendmentTypes = this.amendmentTypes.filter((type: AnyObject) => {
        return ['no_cost', 'other'].indexOf(type.value) > -1;
      });
    } else {
      this.filteredAmendmentTypes = JSON.parse(JSON.stringify(this.amendmentTypes));
    }
  }

  onTypesChanged() {
    this.showOtherInput = this.data.types ? this.data.types.indexOf('other') > -1 : false;
    this.warnMessages = this._getSelectedAmendmentTypeWarning(this.data.types);
  }

  _getSelectedAmendmentTypeWarning(types: string[] | undefined) {
    if (!types || !types.length) {
      return [];
    }
    const messages: string[] = [];
    types.forEach((amdType: string) => {
      switch (amdType) {
        case 'admin_error':
          messages.push('Corrections in the programme document due to typos or administrative error.');
          break;
        case 'budget_lte_20':
          messages.push(
            'Changes to the budget of activities resulting in a change in the UNICEF contribution ≤20% of ' +
              'previously approved cash and/or supplies, with or without changes to the programme results.'
          );
          break;
        case 'budget_gt_20':
          messages.push(
            'Changes to the budget of activities resulting in a change in the UNICEF contribution >20% of ' +
              'previously approved cash and/or supplies, with or without changes to the programme results.'
          );
          break;
        case 'no_cost':
          messages.push('No cost extension');
          break;
        case 'change':
          messages.push(
            'Changes to planned results, population or geographical coverage of the programme with no ' +
              'change in UNICEF contribution.'
          );
          break;
        case 'other':
          messages.push('Other');
          break;
      }
    });
    return messages;
  }

  _validateAndSaveAmendment() {
    if (!validateRequiredFields(this)) {
      return;
    }
    this._saveAmendment(this.data);
  }

  _saveAmendment(newAmendment: Partial<InterventionAmendment>) {
    if (!newAmendment.internal_prc_review) {
      delete newAmendment.internal_prc_review;
    }
    const options = {
      method: 'POST',
      endpoint: getEndpoint(interventionEndpoints.interventionAmendmentAdd, {
        intervId: this.intervention.id
      }),
      body: newAmendment
    };
    this.startSpinner();
    sendRequest(options)
      .then((resp: InterventionAmendment) => {
        this._handleResponse(resp);
        this.stopSpinner();
      })
      .catch((error: any) => {
        this._handleErrorResponse(error);
        this.stopSpinner();
      });
  }

  _handleResponse(response: InterventionAmendment) {
    this.intervention.amendments.push(response);
    getStore().dispatch(updateCurrentIntervention(this.intervention));
    this.handleDialogClose();
  }

  _handleErrorResponse(error: any) {
    parseRequestErrorsAndShowAsToastMsgs(error, this.toastEventSource);
  }

  _amendmentUploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      this.data.signed_amendment_attachment = uploadResponse.id;
      this.data = {...this.data};
      this.data.signed_amendment_attachment = uploadResponse.id;
    }
  }

  _prcReviewUploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      this.data.internal_prc_review = uploadResponse.id;
      this.data = {...this.data};
      this.data.internal_prc_review = uploadResponse.id;
    }
  }

  _resetFields() {
    this.originalData = {...{types: [], signed_date: ''}};
    this.data = {...this.originalData};
    resetRequiredFields(this);
  }

  public async openDialog() {
    this.dialogOpened = true;
    this._filterAmendmentTypes(this.amendmentTypes, this.intervention.document_type);
    this._resetFields();
  }

  public handleDialogClose() {
    this.dialogOpened = false;
    // clear controls
    this.originalData = {...{}};
  }

  getCurrentDate() {
    return new Date();
  }
}
