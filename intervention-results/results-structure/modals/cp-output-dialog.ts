import {LitElement, html, TemplateResult, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-dialog';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '../../../utils/endpoint-helper';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {getStore} from '../../../utils/redux-store-access';
import {getIntervention} from '../../../common/actions/interventions';
import {fireEvent} from '../../../utils/fire-custom-event';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import {AsyncAction, ResultIndicator, GenericObject} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';

@customElement('cp-output-dialog')
export class CpOutputDialog extends LitElement {
  @property() dialogOpened = true;
  @property() loadingInProcess = false;

  @property() indicators: ResultIndicator[] = [];
  @property() selectedIndicators: number[] = [];
  @property() selectedCpOutput?: number;
  @property() errors: GenericObject<any> = {};
  @property() cpOutputs: any[] = [];
  @property({type: String}) spinnerText!: string;

  cpOutputId!: number;
  cpOutputName!: string;
  resultLinkId!: number;
  interventionId!: number;

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {cpOutputs, resultLink, interventionId}: any = data;
    if (resultLink) {
      this.cpOutputId = resultLink.cp_output;
      this.selectedCpOutput = resultLink.cp_output;
      this.cpOutputName = resultLink.cp_output_name;
      this.selectedIndicators = resultLink.ram_indicators || [];
      this.resultLinkId = resultLink.id;
    }
    this.interventionId = interventionId;
    this.cpOutputs = cpOutputs;
    this.loadRamIndicators(this.cpOutputId);
  }

  get dialogTitle(): string {
    let title = '';
    if (this.cpOutputName) {
      title = getTranslation('INTERVENTION_RESULTS.CP_OUTPUT_DIALOG.INDICATORS_FOR_CP_OUTPUT') + this.cpOutputName;
    } else {
      title = getTranslation('INTERVENTION_RESULTS.CP_OUTPUT_DIALOG.ADD_CP_OUTPUT');
    }
    return title;
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
      </style>
      <etools-dialog
        size="md"
        keep-dialog-open
        ?opened="${this.dialogOpened}"
        dialog-title="${this.dialogTitle} "
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        ?show-spinner="${this.loadingInProcess}"
        spinner-text="${this.spinnerText}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        no-padding
      >
        <div class="container layout vertical">
          ${!this.cpOutputId
            ? html`
                <etools-dropdown
                  class="validate-input flex-1"
                  @etools-selected-item-changed="${({detail}: CustomEvent) =>
                    this.onCpOutputSelected(detail.selectedItem && detail.selectedItem.id)}"
                  ?trigger-value-change-event="${!this.loadingInProcess}"
                  .selected="${this.selectedCpOutput}"
                  label=${translate('INTERVENTION_RESULTS.CP_OUTPUT_DIALOG.CP_OUTPUT')}
                  placeholder="&#8212;"
                  .options="${this.cpOutputs}"
                  option-label="name"
                  option-value="id"
                  allow-outside-scroll
                  dynamic-align
                  required
                  ?invalid="${this.errors.cp_output}"
                  .errorMessage="${this.errors.cp_output && this.errors.cp_output[0]}"
                  @focus="${() => this.resetFieldError('cp_output')}"
                  @click="${() => this.resetFieldError('cp_output')}"
                ></etools-dropdown>
              `
            : html``}
          <etools-dropdown-multi
            class="validate-input disabled-as-readonly flex-1"
            @etools-selected-items-changed="${({detail}: CustomEvent) =>
              this.onIndicatorsSelected(detail.selectedItems)}"
            ?trigger-value-change-event="${!this.loadingInProcess}"
            .selectedValues="${this.selectedIndicators}"
            label=${translate('INTERVENTION_RESULTS.CP_OUTPUT_DIALOG.RAM_INDICATORS')}
            placeholder="&#8212;"
            .options="${this.indicators}"
            option-label="name"
            option-value="id"
            allow-outside-scroll
            dynamic-align
            ?invalid="${this.errors.ram_indicators}"
            ?disabled="${!this.selectedCpOutput}"
            .errorMessage="${this.errors.ram_indicators && this.errors.ram_indicators[0]}"
            @focus="${() => this.resetFieldError('ram_indicators')}"
            @click="${() => this.resetFieldError('ram_indicators')}"
          ></etools-dropdown-multi>
        </div>
      </etools-dialog>
    `;
  }

  onIndicatorsSelected(data: ResultIndicator[]) {
    this.selectedIndicators = data.map(({id}: ResultIndicator) => id);
  }

  onCpOutputSelected(id: number) {
    this.selectedCpOutput = id;
    this.loadRamIndicators(id);
  }

  resetFieldError(field: string) {
    delete this.errors[field];
    this.performUpdate();
  }

  processRequest() {
    if (!this.cpOutputId && !this.selectedCpOutput) {
      this.errors.cp_output = [getTranslation('GENERAL.REQUIRED_FIELD')];
      this.performUpdate();
      return;
    }
    this.spinnerText = getTranslation('GENERAL.SAVING_DATA');
    this.loadingInProcess = true;
    const endpoint = this.cpOutputId
      ? getEndpoint(interventionEndpoints.resultLinkGetDelete, {result_link: this.resultLinkId})
      : getEndpoint(interventionEndpoints.resultLinks, {id: this.interventionId});
    const method = this.cpOutputId ? 'PATCH' : 'POST';
    const body: GenericObject<any> = {ram_indicators: this.selectedIndicators};
    if (!this.cpOutputId) {
      body.cp_output = this.selectedCpOutput;
    }
    sendRequest({
      endpoint,
      body,
      method
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
        fireEvent(this, 'toast', {text: getTranslation('INTERVENTION_RESULTS.CP_OUTPUT_DIALOG.CAN_NOT_SAVE_IND')});
      });
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  private loadRamIndicators(cpOutputId: number): void {
    if (!cpOutputId) {
      return;
    }
    this.spinnerText = getTranslation('GENERAL.LOADING');
    this.loadingInProcess = true;
    sendRequest({
      endpoint: getEndpoint(interventionEndpoints.ramIndicators, {id: cpOutputId})
    }).then((data: ResultIndicator[]) => {
      this.loadingInProcess = false;
      this.indicators = data;
    });
  }
}
