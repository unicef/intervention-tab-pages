import {LitElement, html, TemplateResult} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {DataMixin} from '@unicef-polymer/etools-modules-common/dist/mixins/data-mixin';
import {getDifference} from '@unicef-polymer/etools-modules-common/dist/mixins/objects-diff';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {updateCurrentIntervention} from '../../../common/actions/interventions';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {validateRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import {CpOutput} from '@unicef-polymer/etools-types';
import {ResultLinkLowerResult} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';

@customElement('pd-output-dialog')
export class PdOutputDialog extends DataMixin()<ResultLinkLowerResult>(LitElement) {
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

  static get styles() {
    return [layoutStyles];
  }

  protected render(): TemplateResult {
    // language=html
    return html`
      ${sharedStyles}
      <style>
        .container {
          padding: 12px 24px;
        }
        .unassociated-warning {
          display: flex;
          flex-direction: column;
          font-size: var(--etools-font-size-13, 13px);
          align-items: flex-start;
          padding: 12px 22px;
          background: #ffaa0eb8;
        }
        etools-icon {
          margin-inline-end: 10px;
        }
        *[hidden] {
          display: none;
        }
      </style>
      <etools-dialog
        size="md"
        keep-dialog-open
        ?show-spinner="${this.loadingInProcess}"
        dialog-title="${this.isEditDialog ? translate('GENERAL.EDIT') : translate('GENERAL.ADD')} ${translate(
          'PD_OUTPUT'
        )}"
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
      >
        <div class="unassociated-warning" ?hidden="${!this.unassociated || this.hideCpOutputs}">
          <div><etools-icon name="warning"></etools-icon>${translate('ASSOCIATE_PROMPT')}</div>
          ${!this.cpOutputs.length
            ? html` <div><br /><etools-icon name="warning"></etools-icon> ${translate('ASSOCIATE_MSG')}</div> `
            : ''}
        </div>
        <div class="row">
          <div class="col-12">
            <etools-input
              class="validate-input"
              label=${translate('PD_OUTPUT_NAME')}
              placeholder="&#8212;"
              .value="${this.editedData.name}"
              @value-changed="${({detail}: CustomEvent) => this.updateModelValue('name', detail.value)}"
              required
              auto-validate
              ?invalid="${this.errors.name}"
              .errorMessage="${(this.errors.name && this.errors.name[0]) || translate('GENERAL.REQUIRED_FIELD')}"
              @focus="${() => this.resetFieldError('name')}"
              @click="${() => this.resetFieldError('name')}"
            ></etools-input>
          </div>
          ${this.hideCpOutputs
            ? ''
            : html`
                <div class="col-12">
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
                </div>
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
    const endpoint: RequestEndpoint = this.isEditDialog
      ? getEndpoint(interventionEndpoints.pdOutputDetails, {
          pd_id: this.editedData.id,
          intervention_id: this.interventionId
        })
      : getEndpoint(interventionEndpoints.createPdOutput, {intervention_id: this.interventionId});

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
      .then((response: any) => getStore().dispatch(updateCurrentIntervention(response.intervention)))
      .then(() => {
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch((error: any) => {
        this.loadingInProcess = false;
        this.errors = (error && error.response) || {};
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      });
  }
}
