import {CSSResultArray, customElement, html, LitElement, property, TemplateResult} from 'lit-element';
import {DataMixin} from '../../../../common/mixins/data-mixin';
import {InterventionActivity, InterventionActivityItem} from '../../../../common/models/intervention.types';
import '@unicef-polymer/etools-currency-amount-input';
import '@polymer/paper-input/paper-textarea';
import '@polymer/paper-toggle-button';
import './activity-items-table';
import {gridLayoutStylesLit} from '../../../../common/styles/grid-layout-styles-lit';
import {formatCurrency, getTotal} from './get-total.helper';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '../../../../utils/endpoint-helper';
import {interventionEndpoints} from '../../../../utils/intervention-endpoints';
import {getDifference} from '../../../../common/mixins/objects-diff';
import {getStore} from '../../../../utils/redux-store-access';
import './activity-timeframes';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {ActivityItemsTable} from './activity-items-table';
import {getIntervention} from '../../../../common/actions';

@customElement('activity-data-dialog')
export class ActivityDataDialog extends DataMixin()<InterventionActivity>(LitElement) {
  static get styles(): CSSResultArray {
    return [gridLayoutStylesLit];
  }

  @property() dialogOpened = true;
  @property() loadingInProcess = false;
  @property() isEditDialog = true;
  @property() useInputLevel = false;

  set dialogData({activityId, pdOutputId, interventionId, quarters}: any) {
    this.interventionId = interventionId;
    if (!activityId) {
      this.data = {time_frames: quarters} as InterventionActivity;
      this.isEditDialog = false;
      this.endpoint = getEndpoint(interventionEndpoints.pdActivities, {pdOutputId, interventionId});
      return;
    }

    this.loadingInProcess = true;
    this.endpoint = getEndpoint(interventionEndpoints.pdActivityDetails, {activityId, pdOutputId, interventionId});
    sendRequest({
      endpoint: this.endpoint
    }).then((data: InterventionActivity) => {
      this.data = data;
      this.useInputLevel = Boolean(data.items.length);
      this.loadingInProcess = false;
    });
  }

  private endpoint!: EtoolsRequestEndpoint;
  private interventionId!: number;

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
        *[hidden] {
          display: none;
        }
        .total-input,
        etools-currency-amount-input {
          margin-right: 24px;
        }
        .total {
          justify-content: flex-end;
        }
        .total-input,
        .total paper-input {
          --paper-input-container-color: transparent;
          --paper-input-container-focus-color: transparent;
        }
        paper-textarea {
          --paper-input-container-input: {
            display: block;
          }
        }
        paper-toggle-button {
          margin: 25px 0;
        }
      </style>
      <etools-dialog
        size="md"
        keep-dialog-open
        ?opened="${this.dialogOpened}"
        dialog-title="Activity Data"
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        .okBtnText="Save"
        no-padding
      >
        <etools-loading ?active="${this.loadingInProcess}" loading-text="Loading..."></etools-loading>
        <div class="container layout vertical">
          <paper-input
            class="validate-input flex-1"
            label="Activity name"
            placeholder="Enter Activity Name"
            .value="${this.editedData.name}"
            @value-changed="${({detail}: CustomEvent) => this.updateModelValue('name', detail.value)}"
            required
            ?invalid="${this.errors.name}"
            .errorMessage="${this.errors.name && this.errors.name[0]}"
            @focus="${() => this.resetFieldError('name')}"
            @tap="${() => this.resetFieldError('name')}"
          ></paper-input>

          <paper-textarea
            class="validate-input flex-1"
            label="Other Notes"
            placeholder="Enter Other Notes"
            .value="${this.editedData.context_details}"
            @value-changed="${({detail}: CustomEvent) => this.updateModelValue('context_details', detail.value)}"
            ?invalid="${this.errors.context_details}"
            .errorMessage="${this.errors.context_details && this.errors.context_details[0]}"
            @focus="${() => this.resetFieldError('context_details')}"
            @tap="${() => this.resetFieldError('context_details')}"
          ></paper-textarea>

          <div class="layout-horizontal align-items-center">
            ${!this.useInputLevel
              ? html`
                  <etools-currency-amount-input
                    class="col-2"
                    label="CSO Cache Budget"
                    .value="${this.editedData.cso_cash}"
                    @value-changed="${({detail}: CustomEvent) => this.updateModelValue('cso_cash', detail.value)}"
                  ></etools-currency-amount-input>

                  <etools-currency-amount-input
                    class="col-2"
                    label="Unicef Cache Budget"
                    .value="${this.editedData.unicef_cash}"
                    @value-changed="${({detail}: CustomEvent) => this.updateModelValue('unicef_cash', detail.value)}"
                  ></etools-currency-amount-input>
                `
              : html`
                  <paper-input
                    readonly
                    class="col-2 total-input"
                    label="CSO Cache Budget"
                    .value="${this.getSumValue('cso_cash')}"
                  ></paper-input>
                  <paper-input
                    readonly
                    class="col-2 total-input"
                    label="Unicef Cache Budget"
                    .value="${this.getSumValue('unicef_cash')}"
                  ></paper-input>
                `}

            <div class="flex-auto layout-horizontal total">
              <paper-input readonly class="col-4" label="Total" .value="${this.getTotalValue()}"></paper-input>
            </div>
          </div>

          <paper-toggle-button ?checked="${this.useInputLevel}" @iron-change="${this.inputLevelChange}" class="col-3">
            Use Input-level
          </paper-toggle-button>

          <activity-items-table
            ?hidden="${!this.useInputLevel}"
            .activityItems="${this.editedData.items || []}"
            @activity-items-changed="${({detail}: CustomEvent) => {
              this.editedData.items = detail;
              this.performUpdate();
            }}"
          ></activity-items-table>

          <activity-time-frames
            .timeFrames="${this.editedData.time_frames}"
            @time-frames-changed="${({detail}: CustomEvent) => {
              this.editedData.time_frames = detail;
              this.performUpdate();
            }}"
          ></activity-time-frames>
        </div>
      </etools-dialog>
    `;
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  getSumValue(field: 'cso_cash' | 'unicef_cash'): string {
    return formatCurrency(
      (this.editedData.items || []).reduce(
        (sum: number, item: Partial<InterventionActivityItem>) => sum + Number(item[field]),
        0
      )
    );
  }

  getTotalValue(): string {
    if (!this.useInputLevel) {
      return getTotal(this.editedData.cso_cash || 0, this.editedData.unicef_cash || 0);
    } else {
      const cso: string = this.getSumValue('cso_cash').replace(/,/g, '');
      const unicef: string = this.getSumValue('unicef_cash').replace(/,/g, '');
      return getTotal(cso, unicef);
    }
  }

  inputLevelChange(e: CustomEvent): void {
    if (!e.detail) {
      return;
    }
    const element = e.currentTarget as HTMLInputElement;
    this.useInputLevel = element.checked;
    this.editedData = {
      ...this.editedData,
      items: this.useInputLevel ? this.editedData.items : [],
      cso_cash: '0',
      unicef_cash: '0'
    };
  }

  processRequest(): void {
    if (this.loadingInProcess) {
      return;
    }

    // get changed fields
    const diff: Partial<InterventionActivity> = getDifference<InterventionActivity>(
      this.isEditDialog ? (this.originalData as InterventionActivity) : {},
      this.editedData,
      {
        toRequest: true,
        nestedFields: ['items']
      }
    );
    if (!this.validateActivityItems()) {
      fireEvent(this, 'toast', {text: 'Please fill all Activity Items names'});
      return;
    }
    this.loadingInProcess = true;
    sendRequest({
      endpoint: this.endpoint,
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
        fireEvent(this, 'toast', {text: 'Can not save PD Activity!'});
      });
  }

  validateActivityItems(): boolean {
    const itemsTable: ActivityItemsTable | null = this.shadowRoot!.querySelector('activity-items-table');
    return itemsTable !== null && itemsTable.validate();
  }
}
