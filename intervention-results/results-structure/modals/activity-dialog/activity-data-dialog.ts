import {CSSResultArray, customElement, html, LitElement, property, TemplateResult} from 'lit-element';
import {DataMixin} from '../../../../common/mixins/data-mixin';
import '@unicef-polymer/etools-currency-amount-input';
import '@polymer/paper-input/paper-textarea';
import '@polymer/paper-toggle-button';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
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
import {updateCurrentIntervention} from '../../../../common/actions/interventions';
import {ActivityTimeFrames} from './activity-timeframes';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {validateRequiredFields} from '../../../../utils/validation-helper';
import {sharedStyles} from '../../../../common/styles/shared-styles-lit';
import {InterventionActivity, InterventionActivityItem} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';

@customElement('activity-data-dialog')
export class ActivityDataDialog extends DataMixin()<InterventionActivity>(LitElement) {
  static get styles(): CSSResultArray {
    return [gridLayoutStylesLit];
  }

  @property() dialogOpened = true;
  @property() loadingInProcess = false;
  @property() isEditDialog = true;
  @property() useInputLevel = false;
  @property({type: String}) spinnerText = 'Loading...';
  @property() readonly: boolean | undefined = false;
  quarters: ActivityTimeFrames[] = [];

  set dialogData({activityId, pdOutputId, interventionId, quarters, readonly}: any) {
    this.quarters = quarters;
    this.readonly = readonly;
    if (!activityId) {
      this.data = {} as InterventionActivity;
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
      this.spinnerText = 'Saving data...';
    });
  }

  private endpoint!: EtoolsRequestEndpoint;

  protected render(): TemplateResult {
    // language=html
    return html`
      <style>
        ${sharedStyles} etools-dialog::part(ed-scrollable) {
          margin-top: 0 !important;
        }

        etools-dialog::part(ed-button-styles) {
          margin-top: 0;
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
        .general-total {
          min-width: 155px;
        }
        paper-textarea {
          --paper-input-container-input: {
            display: block;
          }
        }
        paper-toggle-button {
          margin: 25px 0;
        }
        etools-dialog paper-textarea {
          --iron-autogrow-textarea: {
            overflow: auto;
            padding: 0;
            max-height: 96px;
          }
        }
      </style>

      <!-- ATTENTION spinner-text property binding WORKS WITHOUT '.'  -->
      <etools-dialog
        size="md"
        keep-dialog-open
        ?opened="${this.dialogOpened}"
        ?show-spinner="${this.loadingInProcess}"
        spinner-text="${this.spinnerText}"
        dialog-title=${translate('ACTIVITY_DATA')}
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        .hideConfirmBtn="${this.readonly}"
        no-padding
      >
        <div class="container layout vertical">
          <paper-input
            class="validate-input flex-1"
            label=${translate('ACTIVITY_NAME')}
            placeholder="&#8212;"
            .value="${this.editedData.name}"
            @value-changed="${({detail}: CustomEvent) => this.updateModelValue('name', detail.value)}"
            required
            auto-validate
            ?invalid="${this.errors.name}"
            .errorMessage="${(this.errors.name && this.errors.name[0]) || translate('GENERAL.REQUIRED_FIELD')}"
            ?readonly="${this.readonly}"
            @focus="${() => this.resetFieldError('name')}"
            @click="${() => this.resetFieldError('name')}"
          ></paper-input>

          <paper-textarea
            class="validate-input flex-1"
            label=${translate('OTHER_NOTES')}
            placeholder="&#8212;"
            .value="${this.editedData.context_details}"
            @value-changed="${({detail}: CustomEvent) => this.updateModelValue('context_details', detail.value)}"
            ?invalid="${this.errors.context_details}"
            .errorMessage="${this.errors.context_details && this.errors.context_details[0]}"
            ?readonly="${this.readonly}"
            @focus="${() => this.resetFieldError('context_details')}"
            @click="${() => this.resetFieldError('context_details')}"
          ></paper-textarea>

          <div class="layout-horizontal align-items-center">
            ${!this.useInputLevel
              ? html`
                  <etools-currency-amount-input
                    class="col-3"
                    label=${translate('PARTNER_CASH_BUDGET')}
                    ?readonly="${this.readonly}"
                    .value="${this.editedData.cso_cash}"
                    @value-changed="${({detail}: CustomEvent) => this.updateModelValue('cso_cash', detail.value)}"
                  ></etools-currency-amount-input>

                  <etools-currency-amount-input
                    class="col-3"
                    label=${translate('UNICEF_CASH_BUDGET')}
                    ?readonly="${this.readonly}"
                    .value="${this.editedData.unicef_cash}"
                    @value-changed="${({detail}: CustomEvent) => this.updateModelValue('unicef_cash', detail.value)}"
                  ></etools-currency-amount-input>
                `
              : html`
                  <paper-input
                    readonly
                    tabindex="-1"
                    class="col-3 total-input"
                    label=${translate('PARTNER_CASH_BUDGET')}
                    .value="${this.getSumValue('cso_cash')}"
                  ></paper-input>
                  <paper-input
                    readonly
                    tabindex="-1"
                    class="col-3 total-input"
                    label=${translate('UNICEF_CASH_BUDGET')}
                    .value="${this.getSumValue('unicef_cash')}"
                  ></paper-input>
                `}

            <div class="flex-auto layout-horizontal total">
              <paper-input
                readonly
                tabindex="-1"
                class="col-6 general-total"
                label=${translate('GENERAL.TOTAL')}
                .value="${this.getTotalValue()}"
              ></paper-input>
            </div>
          </div>

          <paper-toggle-button
            ?disabled="${this.readonly}"
            ?checked="${this.useInputLevel}"
            @iron-change="${this.inputLevelChange}"
            class="col-5"
          >
            ${translate('USE_INPUT_LEVEL')}
          </paper-toggle-button>
          <activity-items-table
            ?hidden="${!this.useInputLevel}"
            .activityItems="${this.editedData.items || []}"
            .readonly="${this.readonly}"
            @activity-items-changed="${({detail}: CustomEvent) => {
              this.editedData.items = detail;
              this.requestUpdate();
            }}"
          ></activity-items-table>
          <activity-time-frames
            .quarters="${this.quarters}"
            .selectedTimeFrames="${this.editedData.time_frames || []}"
            .readonly="${this.readonly}"
            @time-frames-changed="${({detail}: CustomEvent) => {
              this.editedData.time_frames = detail;
              this.requestUpdate();
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

  validate() {
    return validateRequiredFields(this);
  }

  processRequest(): void {
    if (this.loadingInProcess) {
      return;
    }

    if (!this.validate()) {
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
      fireEvent(this, 'toast', {
        text: getTranslation('FILL_ALL_ACTIVITY_ITEMS')
      });
      return;
    }
    if (!this.validateActivityTimeFrames()) {
      fireEvent(this, 'toast', {
        text: getTranslation('FILL_ACTIVITY_TIME')
      });
      return;
    }
    this.loadingInProcess = true;
    sendRequest({
      endpoint: this.endpoint,
      method: this.isEditDialog ? 'PATCH' : 'POST',
      body: this.isEditDialog ? {id: this.editedData.id, ...diff} : diff
    })
      .then((response: any) => getStore().dispatch(updateCurrentIntervention(response.intervention)))
      .then(() => {
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch((error) => {
        this.loadingInProcess = false;
        this.errors = (error && error.response) || {};
        fireEvent(this, 'toast', {text: formatServerErrorAsText(error)});
      });
  }

  validateActivityItems(): boolean {
    const itemsTable: ActivityItemsTable | null = this.shadowRoot!.querySelector('activity-items-table');
    return itemsTable !== null && itemsTable.validate();
  }

  validateActivityTimeFrames() {
    const items: ActivityTimeFrames | null = this.shadowRoot!.querySelector('activity-time-frames');
    return items !== null && items.validate();
  }
}
