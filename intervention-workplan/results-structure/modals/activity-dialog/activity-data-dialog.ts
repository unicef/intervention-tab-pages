import {CSSResultArray, html, LitElement, TemplateResult} from 'lit';
import {property, customElement, query} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '../../../../common/components/activity/activity-items-table';
import {getTotalCashFormatted} from '../../../../common/components/activity/get-total.helper';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {interventionEndpoints} from '../../../../utils/intervention-endpoints';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import './activity-timeframes';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {ActivityItemsTable} from '../../../../common/components/activity/activity-items-table';
import {updateCurrentIntervention} from '../../../../common/actions/interventions';
import {ActivityTimeFrames} from './activity-timeframes';
import {formatServerErrorAsText} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {AnyObject, EtoolsEndpoint, InterventionActivity, InterventionActivityItem} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {translatesMap} from '../../../../utils/intervention-labels-map';
import {DataMixin} from '@unicef-polymer/etools-modules-common/dist/mixins/data-mixin';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {validateRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import EtoolsDialog from '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import cloneDeep from 'lodash-es/cloneDeep';
import {displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';

@customElement('activity-data-dialog')
export class ActivityDataDialog extends DataMixin()<InterventionActivity>(LitElement) {
  static get styles(): CSSResultArray {
    return [layoutStyles];
  }

  @property({type: String})
  currency = '';
  @property() loadingInProcess = false;
  @property() isEditDialog = true;
  @property() useInputLevel = false;
  @property({type: String}) spinnerText = getTranslation('GENERAL.LOADING');
  @property() readonly: boolean | undefined = false;
  @query('etools-dialog') private dialogElement!: EtoolsDialog;
  @query('activity-items-table') private activityItemsTable!: ActivityItemsTable;
  quarters: ActivityTimeFrames[] = [];

  set dialogData({activityId, pdOutputId, interventionId, quarters, readonly, currency}: any) {
    this.quarters = quarters;
    this.readonly = readonly;
    this.currency = currency;
    if (!activityId) {
      this.data = {} as InterventionActivity;
      this.isEditDialog = false;
      this.endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.pdActivities, {
        pdOutputId,
        interventionId
      });
      return;
    }

    this.loadingInProcess = true;
    this.endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.pdActivityDetails, {
      activityId,
      pdOutputId,
      interventionId
    });
    sendRequest({
      endpoint: this.endpoint
    }).then((data: InterventionActivity) => {
      this.useInputLevel = Boolean(data.items.length);
      setTimeout(() => {
        // Avoid reset caused by inputLevelChange method
        this.data = data;
        this.loadingInProcess = false;
        this.spinnerText = getTranslation('GENERAL.SAVING_DATA');
      }, 100);
    });
  }

  private endpoint!: RequestEndpoint;

  protected render(): TemplateResult {
    // language=html
    return html`
      ${sharedStyles}
      <style>
        etools-dialog::part(panel) {
          width: 1200px;
        }

        .container {
          padding: 12px 24px;
        }
        *[hidden] {
          display: none;
        }
        .total-input,
        etools-currency {
          margin-inline-end: 24px;
        }
        .total {
          justify-content: center;
          display: flex;
        }
        .general-total {
          min-width: 155px;
          width: auto !important;
        }
        sl-switch {
          margin: 8px 0;
          width: min-content;
          white-space: nowrap;
        }
        etools-dialog etools-textarea::part(textarea) {
          max-height: 96px;
          overflow-y: auto;
        }
        etools-dialog etools-textarea::part(textarea) {
          max-height: unset;
        }
        @media (max-width: 768px) {
          .total {
            justify-content: start;
          }
        }
      </style>

      <!-- ATTENTION spinner-text property binding WORKS WITHOUT '.'  -->
      <etools-dialog
        size="lg"
        keep-dialog-open
        ?show-spinner="${this.loadingInProcess}"
        spinner-text="${this.spinnerText}"
        dialog-title=${translate('ACTIVITY_DATA')}
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        .hideConfirmBtn="${this.readonly}"
      >
        <div class="row">
          <div class="col-12">
            <etools-input
              class="validate-input"
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
            ></etools-input>
          </div>
          <div class="col-12">
            <etools-textarea
              class="validate-input"
              label=${translate('OTHER_NOTES')}
              placeholder="&#8212;"
              .value="${this.editedData.context_details}"
              @value-changed="${({detail}: CustomEvent) => this.updateModelValue('context_details', detail.value)}"
              ?invalid="${this.errors.context_details}"
              .errorMessage="${this.errors.context_details && this.errors.context_details[0]}"
              ?readonly="${this.readonly}"
              @focus="${() => this.resetFieldError('context_details')}"
              @click="${() => this.resetFieldError('context_details')}"
            ></etools-textarea>
          </div>
          </div>
          <div class="row">
            ${
              !this.useInputLevel
                ? html`
                    <div class="col-md-3 col-6">
                      <etools-currency
                        label=${translate(translatesMap.cso_cash)}
                        ?readonly="${this.readonly}"
                        .value="${this.editedData.cso_cash}"
                        @value-changed="${({detail}: CustomEvent) => this.updateModelValue('cso_cash', detail.value)}"
                        required
                      ></etools-currency>
                    </div>
                    <div class="col-md-3 col-6">
                      <etools-currency
                        label=${translate('UNICEF_CASH_BUDGET')}
                        ?readonly="${this.readonly}"
                        required
                        .value="${this.editedData.unicef_cash}"
                        @value-changed="${({detail}: CustomEvent) =>
                          this.updateModelValue('unicef_cash', detail.value)}"
                      ></etools-currency>
                    </div>
                  `
                : html`
                    <div class="col-md-3 col-6">
                      <etools-input
                        readonly
                        tabindex="-1"
                        class="total-input"
                        label=${translate('PARTNER_CASH_BUDGET')}
                        .value="${this.getSumValue('cso_cash')}"
                      ></etools-input>
                    </div>
                    <div class="col-md-3 col-6">
                      <etools-input
                        readonly
                        tabindex="-1"
                        class="total-input"
                        label=${translate('UNICEF_CASH_BUDGET')}
                        .value="${this.getSumValue('unicef_cash')}"
                      ></etools-input>
                    </div>
                  `
            }

              <div class="col-md-6 col-12 total">
                <etools-input
                  readonly
                  tabindex="-1"
                  class="general-total"
                  label="${translate('GENERAL.TOTAL')} (${this.currency})"
                  .value="${this.getTotalValue()}"
                ></etools-input>
                </div>
            </div>
          </div>

          <sl-switch
            ?disabled="${this.readonly}"
            ?checked="${this.useInputLevel}"
            @sl-change="${this.inputLevelChange}"
          >
            ${translate('USE_INPUT_LEVEL')}
          </sl-switch>
          <activity-items-table
            .dialogElement=${this.dialogElement}
            ?hidden="${!this.useInputLevel}"
            .activityItems="${this.editedData.items || []}"
            .readonly="${this.readonly}"
            .currency="${this.currency}"
            @activity-items-changed="${({detail}: CustomEvent) => {
              this.editedData.items = detail;
              this.requestUpdate();
            }}"
          ></activity-items-table>
          <activity-time-frames
            tabindex="0"
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
    const columnTotal = (this.editedData.items || []).reduce(
      (sum: number, item: Partial<InterventionActivityItem>) => sum + Number(item[field]),
      0
    );

    return displayCurrencyAmount(String(columnTotal), '0', 2);
  }

  getTotalValue(): string {
    if (!this.useInputLevel) {
      return getTotalCashFormatted(this.editedData.cso_cash || 0, this.editedData.unicef_cash || 0);
    } else {
      const cso: string = this.getSumValue('cso_cash').replace(/,/g, '');
      const unicef: string = this.getSumValue('unicef_cash').replace(/,/g, '');
      return getTotalCashFormatted(cso, unicef);
    }
  }

  inputLevelChange(e: CustomEvent): void {
    if (!e.target) {
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

    setTimeout(() => {
      if ((!this.editedData.items || !this.editedData.items.length) && this.activityItemsTable) {
        this.activityItemsTable.addNew();
      }
    }, 0);
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

    const activityItemsValidationSummary = this.validateActivityItems();
    if (activityItemsValidationSummary) {
      fireEvent(this, 'toast', {
        text: activityItemsValidationSummary.invalidRequired
          ? getTranslation('FILL_ALL_ACTIVITY_ITEMS')
          : getTranslation('INVALID_TOTAL_ACTIVITY_ITEMS')
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
    // const dataToSave = this.getChangedFields();

    const dataToSave = cloneDeep(this.editedData);
    if (dataToSave.items?.length) {
      // Let backend calculate these
      delete dataToSave.unicef_cash;
      delete dataToSave.cso_cash;
    }
    sendRequest({
      endpoint: this.endpoint,
      method: this.isEditDialog ? 'PATCH' : 'POST',
      body: this.isEditDialog ? {id: this.editedData.id, ...dataToSave} : dataToSave
    })
      .then((response: any) => getStore().dispatch(updateCurrentIntervention(response.intervention)))
      .then(() => {
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch((error: any) => {
        this.loadingInProcess = false;
        this.errors = (error && error.response) || {};
        fireEvent(this, 'toast', {text: formatServerErrorAsText(error)});
      });
  }

  // private getChangedFields() {
  //   const diff: Partial<InterventionActivity> = getDifference<InterventionActivity>(
  //     this.isEditDialog ? (this.originalData as InterventionActivity) : {},
  //     this.editedData,
  //     {
  //       toRequest: true,
  //       nestedFields: ['items']
  //     }
  //   );

  //   return diff;
  // }

  validateActivityItems(): AnyObject | undefined {
    const itemsTable: ActivityItemsTable | null = this.shadowRoot!.querySelector('activity-items-table');
    return itemsTable !== null ? itemsTable.validate() : undefined;
  }

  validateActivityTimeFrames() {
    const items: ActivityTimeFrames | null = this.shadowRoot!.querySelector('activity-time-frames');
    return items !== null && items.validate();
  }
}
