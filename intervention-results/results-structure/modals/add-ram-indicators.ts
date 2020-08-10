import {LitElement, html, TemplateResult, property, customElement} from 'lit-element';
import {ResultIndicator} from '../../../common/models/intervention.types';
import '@unicef-polymer/etools-dialog';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '../../../utils/endpoint-helper';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {getStore} from '../../../utils/redux-store-access';
import {GenericObject} from '../../../common/models/globals.types';
import {getIntervention} from '../../../common/actions';
import {fireEvent} from '../../../utils/fire-custom-event';

@customElement('add-ram-indicators')
export class AddRamIndicators extends LitElement {
  @property() dialogOpened = true;
  @property() loadingInProcess = false;

  @property() indicators: ResultIndicator[] = [];
  @property() selectedIndicators: number[] = [];
  @property() errors: GenericObject<any> = {};

  cpOutputId!: number;
  cpOutputName!: string;
  resultLinkId!: number;
  interventionId!: number;

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {cpOutputId, cpOutputName, selectedIndicators, resultLinkId, interventionId}: any = data;
    this.cpOutputId = cpOutputId;
    this.cpOutputName = cpOutputName;
    this.selectedIndicators = selectedIndicators || [];
    this.resultLinkId = resultLinkId;
    this.interventionId = interventionId;
    this.loadIndicators(cpOutputId);
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
        dialog-title="Indicators for CP Output: ${this.cpOutputName} "
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        .okBtnText="Save"
        no-padding
      >
        <etools-loading ?active="${this.loadingInProcess}" loading-text="Loading..."></etools-loading>
        <div class="container layout vertical">
          <etools-dropdown-multi
            class="validate-input disabled-as-readonly flex-1"
            @etools-selected-items-changed="${({detail}: CustomEvent) =>
              this.onIndicatorsSelected(detail.selectedItems)}"
            ?trigger-value-change-event="${!this.loadingInProcess}"
            .selectedValues="${this.selectedIndicators}"
            label="Ram Indicators"
            placeholder="Select Ram Indicators"
            .options="${this.indicators}"
            option-label="name"
            option-value="id"
            allow-outside-scroll
            dynamic-align
            ?invalid="${this.errors.ram_indicators}"
            .errorMessage="${this.errors.ram_indicators && this.errors.ram_indicators[0]}"
            @focus="${() => this.resetFieldError()}"
            @tap="${() => this.resetFieldError()}"
          ></etools-dropdown-multi>
        </div>
      </etools-dialog>
    `;
  }

  onIndicatorsSelected(data: ResultIndicator[]) {
    this.selectedIndicators = data.map(({id}: ResultIndicator) => id);
  }

  resetFieldError() {
    this.errors = {};
  }

  processRequest() {
    this.loadingInProcess = true;
    sendRequest({
      endpoint: getEndpoint(interventionEndpoints.resultLinkDetails, {result_link: this.resultLinkId}),
      body: {ram_indicators: this.selectedIndicators},
      method: 'PATCH'
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
        fireEvent(this, 'toast', {text: 'Can not save indicators!'});
      });
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  private loadIndicators(cpOutputId: number): void {
    this.loadingInProcess = true;
    sendRequest({
      endpoint: getEndpoint(interventionEndpoints.ramIndicators, {id: cpOutputId})
    }).then((data: ResultIndicator[]) => {
      this.loadingInProcess = false;
      this.indicators = data;
    });
  }
}
