import {LitElement, html, TemplateResult, property, customElement} from 'lit-element';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {getEndpoint} from '../../../utils/endpoint-helper';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {DataMixin} from '../../../common/mixins/data-mixin';
import {getDifference} from '../../../common/mixins/objects-diff';
import '@unicef-polymer/etools-dialog';
import {getStore} from '../../../utils/redux-store-access';
import {getIntervention} from '../../../common/actions/interventions';
import {fireEvent} from '../../../utils/fire-custom-event';
import {validateRequiredFields} from '../../../utils/validation-helper';
import {AsyncAction, CpOutput} from '@unicef-polymer/etools-types';
import {ResultLinkLowerResult} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';
import {sharedStyles} from '../../../common/styles/shared-styles-lit';

@customElement('pd-output-dialog')
export class PdOutputDialog extends DataMixin()<ResultLinkLowerResult>(LitElement) {
  @property() dialogOpened = true;
  @property() loadingInProcess = false;
  @property() isEditDialog = false;

  @property() cpOutputs: CpOutput[] = [];
  @property() hideCpOutputs = false;

  interventionId!: number;

  get unassociated(): boolean {
    return Boolean(this.editedData.id && !this.editedData.cp_output);
  }

  set dialogData({pdOutput, cpOutputs, hideCpOutputs, interventionId}: any) {
    this.data = pdOutput || {};
    this.cpOutputs = cpOutputs || [];
    this.hideCpOutputs = hideCpOutputs || !pdOutput || pdOutput.cp_output;
    this.isEditDialog = Boolean(pdOutput && pdOutput.id);
    this.interventionId = interventionId;
  }

  protected render(): TemplateResult {
    // language=html
    return html`
      <style>
        ${sharedStyles}
        etools-dialog::part(ed-scrollable) {
          margin-top: 0 !important;
        }

        etools-dialog::part(ed-button-styles) {
          margin-top: 0 !important;
        }
        .container {
          padding: 12px 24px;
        }
        .unassociated-warning {
          display: flex;
          flex-direction: column;
          font-size: 13px;
          align-items: flex-start;
          padding: 12px 22px;
          background: #ffaa0eb8;
        }
        iron-icon {
          margin-right: 10px;
        }
        *[hidden] {
          display: none;
        }
      </style>
      <etools-dialog
        size="md"
        keep-dialog-open
        ?opened="${this.dialogOpened}"
        ?show-spinner="${this.loadingInProcess}"
        dialog-title="${this.isEditDialog ? translate('GENERAL.EDIT') : translate('GENERAL.ADD')} ${translate(
          'INTERVENTION_RESULTS.PD_OUTPUT_DIALOG.PD_OUTPUT'
        )}"
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        no-padding
      >
        <div class="unassociated-warning" ?hidden="${!this.unassociated || this.hideCpOutputs}">
          <div>
            <iron-icon icon="warning"></iron-icon>${translate('INTERVENTION_RESULTS.PD_OUTPUT_DIALOG.ASSOCIATE_PROMPT')}
          </div>
          ${!this.cpOutputs.length
            ? html`
                <div>
                  <br /><iron-icon icon="warning"></iron-icon> ${translate(
                    'INTERVENTION_RESULTS.PD_OUTPUT_DIALOG.ASSOCIATE_MSG'
                  )}
                </div>
              `
            : ''}
        </div>
        <div class="container layout vertical">
          <paper-input
            class="validate-input flex-1"
            label=${translate('INTERVENTION_RESULTS.PD_OUTPUT_DIALOG.PD_OUTPUT_NAME')}
            placeholder="&#8212;"
            .value="${this.editedData.name}"
            @value-changed="${({detail}: CustomEvent) => this.updateModelValue('name', detail.value)}"
            required
            auto-validate
            ?invalid="${this.errors.name}"
            .errorMessage="${(this.errors.name && this.errors.name[0]) || translate('GENERAL.REQUIRED_FIELD')}"
            @focus="${() => this.resetFieldError('name')}"
            @click="${() => this.resetFieldError('name')}"
          ></paper-input>

          ${this.hideCpOutputs
            ? ''
            : html`
                <etools-dropdown
                  class="validate-input flex-1"
                  @etools-selected-item-changed="${({detail}: CustomEvent) =>
                    this.updateModelValue('cp_output', detail.selectedItem && detail.selectedItem.id)}"
                  ?trigger-value-change-event="${!this.loadingInProcess}"
                  .selected="${this.editedData.cp_output}"
                  label="CP Output"
                  placeholder="&#8212;"
                  .options="${this.cpOutputs}"
                  option-label="name"
                  option-value="id"
                  allow-outside-scroll
                  dynamic-align
                  auto-validate
                  required
                  ?invalid="${this.errors.cp_output}"
                  .errorMessage="${(this.errors.cp_output && this.errors.cp_output[0]) ||
                  translate('GENERAL.REQUIRED_FIELD')}"
                  @focus="${() => this.resetFieldError('cp_output')}"
                  @click="${() => this.resetFieldError('cp_output')}"
                ></etools-dropdown>
              `}
        </div>
      </etools-dialog>
    `;
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  processRequest(): void {
    if (this.loadingInProcess) {
      return;
    }
    if (!validateRequiredFields(this)) {
      return;
    }
    this.loadingInProcess = true;
    // get endpoint
    const endpoint: EtoolsRequestEndpoint = this.isEditDialog
      ? getEndpoint(interventionEndpoints.pdDetails, {pd_id: this.editedData.id, intervention_id: this.interventionId})
      : getEndpoint(interventionEndpoints.createPd, {intervention_id: this.interventionId});

    // get changed fields
    const diff: Partial<ResultLinkLowerResult> = getDifference<ResultLinkLowerResult>(
      this.isEditDialog ? (this.originalData as ResultLinkLowerResult) : {},
      this.editedData,
      {
        toRequest: true
      }
    );
    sendRequest({
      endpoint,
      method: this.isEditDialog ? 'PATCH' : 'POST',
      body: this.isEditDialog ? {id: this.editedData.id, ...diff} : diff
    })
      .then(() =>
        getStore()
          .dispatch<AsyncAction>(getIntervention(String(this.interventionId)))
          .catch(() => Promise.resolve())
      )
      .then(() => {
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch((error) => {
        this.loadingInProcess = false;
        this.errors = (error && error.response) || {};
        fireEvent(this, 'toast', {text: getTranslation('INTERVENTION_RESULTS.PD_OUTPUT_DIALOG.ERR_SAVE_PD_OUTPUT')});
      });
  }
}
