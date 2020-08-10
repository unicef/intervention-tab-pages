import {LitElement, html, TemplateResult, property, customElement} from 'lit-element';
import {CpOutput, ResultLinkLowerResult} from '../../../common/models/intervention.types';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {getEndpoint} from '../../../utils/endpoint-helper';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {DataMixin} from '../../../common/mixins/data-mixin';
import {getDifference} from '../../../common/mixins/objects-diff';
import '@unicef-polymer/etools-dialog';
import {getStore} from '../../../utils/redux-store-access';
import {getIntervention} from '../../../common/actions';
import {fireEvent} from '../../../utils/fire-custom-event';

@customElement('pd-output-dialog')
export class PdOutputDialog extends DataMixin()<ResultLinkLowerResult>(LitElement) {
  @property() dialogOpened = true;
  @property() loadingInProcess = false;
  @property() isEditDialog = false;
  @property() disableCpOutputs = false;

  @property() cpOutputs: CpOutput[] = [];
  @property() hideCpOutputs = false;

  interventionId!: number;

  get unassociated(): boolean {
    return Boolean(this.editedData.id && !this.editedData.cp_output);
  }

  set dialogData({pdOutput, cpOutputs, hideCpOutputs, interventionId}: any) {
    this.data = pdOutput || {};
    this.cpOutputs = cpOutputs || [];
    this.hideCpOutputs = hideCpOutputs;
    this.isEditDialog = Boolean(pdOutput && pdOutput.id);
    this.disableCpOutputs = Boolean(pdOutput && !pdOutput.id && pdOutput.cp_output);
    this.interventionId = interventionId;
  }

  protected render(): TemplateResult {
    // language=html
    return html`
      <style>
        etools-dialog {
          --etools-dialog-scrollable: {
            margin-top: 0 !important;
          }
          --etools-dialog-button-styles: {
            margin-top: 0 !important;
          }
        }
        .container {
          padding: 12px 24px;
        }
        .unassociated-warning {
          display: flex;
          align-items: center;
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
        dialog-title="${this.isEditDialog ? 'Edit' : 'Add'} PD Output"
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        .okBtnText="Save"
        no-padding
      >
        <etools-loading ?active="${this.loadingInProcess}" loading-text="Loading..."></etools-loading>
        <div class="unassociated-warning" ?hidden="${!this.unassociated || this.hideCpOutputs}">
          <iron-icon icon="warning"></iron-icon> Please associate PD with CP Output before moving forward
        </div>
        <div class="container layout vertical">
          <paper-input
            class="validate-input flex-1"
            label="PD Output Name"
            placeholder="Enter PD Output Name"
            .value="${this.editedData.name}"
            @value-changed="${({detail}: CustomEvent) => this.updateModelValue('name', detail.value)}"
            required
            ?invalid="${this.errors.name}"
            .errorMessage="${this.errors.name && this.errors.name[0]}"
            @focus="${() => this.resetFieldError('name')}"
            @tap="${() => this.resetFieldError('name')}"
          ></paper-input>

          <paper-input
            class="validate-input flex-1"
            label="PD Output Code"
            placeholder="Enter PD Output Code"
            .value="${this.editedData.code}"
            @value-changed="${({detail}: CustomEvent) => this.updateModelValue('code', detail.value)}"
            required
            ?invalid="${this.errors.code}"
            .errorMessage="${this.errors.code && this.errors.code[0]}"
            @focus="${() => this.resetFieldError('code')}"
            @tap="${() => this.resetFieldError('code')}"
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
                  placeholder="Select CP Output"
                  .options="${this.cpOutputs}"
                  option-label="name"
                  option-value="id"
                  allow-outside-scroll
                  dynamic-align
                  required
                  ?disabled="${this.disableCpOutputs}"
                  ?invalid="${this.errors.cp_output}"
                  .errorMessage="${this.errors.cp_output && this.errors.cp_output[0]}"
                  @focus="${() => this.resetFieldError('cp_output')}"
                  @tap="${() => this.resetFieldError('cp_output')}"
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
    if (this.unassociated || this.loadingInProcess) {
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
          .dispatch(getIntervention(String(this.interventionId)))
          .catch(() => Promise.resolve())
      )
      .then(() => {
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch((error) => {
        this.loadingInProcess = false;
        this.errors = (error && error.response) || {};
        fireEvent(this, 'toast', {text: 'Can not save PD Output!'});
      });
  }
}
