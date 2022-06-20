import {LitElement, html, property, customElement, query} from 'lit-element';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-currency-amount-input';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {updateCurrentIntervention} from '../../common/actions/interventions';
import {translate, get as getTranslation} from 'lit-translate';
import '../../common/components/activity/activity-items-table';
import {getTotal} from '../../common/components/activity/get-total.helper';
import {cloneDeep} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {AnyObject, ManagementBudgetItem} from '@unicef-polymer/etools-types';
import {ActivityItemsTable} from '../../common/components/activity/activity-items-table';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {removeCurrencyAmountDelimiter} from '../../utils/utils';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {EtoolsCurrencyAmountInput} from '@unicef-polymer/etools-currency-amount-input';

/**
 * @customElement
 */
@customElement('activity-dialog')
export class ActivityDialog extends ComponentBaseMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        *[hidden] {
          display: none !important;
        }
        .layout-horizontal {
          overflow: hidden;
        }
        etools-dialog::part(ed-paper-dialog) {
          width: 98vw !important;
          max-width: 1200px;
        }
        etools-dialog::part(ed-scrollable) {
          margin-top: 0 !important;
        }
        .input-level {
          padding: 25px 0;
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
        .padd-bott {
          padding-bottom: 10px;
        }
      </style>

      <etools-dialog
        id="activityDialog"
        size="lg"
        keep-dialog-open
        dialog-title=${this.readonly ? translate('VIEW_ACTIVITY') : translate('EDIT_ACTIVITY')}
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        ?opened="${this.dialogOpened}"
        ?show-spinner="${this.loadingInProcess}"
        @close="${() => this.onClose()}"
        @confirm-btn-clicked="${this.onSaveClick}"
        .hideConfirmBtn="${this.readonly}"
      >
        <div class="row-padding-v">
          <paper-input
            readonly
            tabindex="-1"
            id="title"
            label=${translate('GENERAL.TITLE')}
            always-float-label
            placeholder="—"
            .value="${this.data.title}"
          >
          </paper-input>
        </div>

        <div class="row-padding-v">
          <paper-textarea
            id="description"
            label=${translate('GENERAL.DESCRIPTION')}
            readonly
            tabindex="-1"
            always-float-label
            placeholder="—"
            .value="${this.data.description}"
          ></paper-textarea>
        </div>

        <div class="layout-horizontal align-items-center padd-bott">
          ${!this.useInputLevel
            ? html`
                  <etools-currency-amount-input
                    class="col-3"
                    id="partnerContribution"
                    label=${translate('PARTNER_CASH_BUDGET')}
                    .value="${this.data[this.getPropertyName('partner')]}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.valueChanged(detail, this.getPropertyName('partner'))}"
                    ?readonly="${this.readonly}"
                    ?required="${!this.useInputLevel}"
                    auto-validate
                  >
                  </etools-currency-amount-input>

                  <etools-currency-amount-input
                    class="col-3"
                    id="unicefCash"
                    label=${translate('UNICEF_CASH_BUDGET')}
                    .value="${this.data[this.getPropertyName('unicef')]}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.valueChanged(detail, this.getPropertyName('unicef'))}"
                    ?readonly="${this.readonly}"
                    ?required="${!this.useInputLevel}"
                    auto-validate
                  >
                  </etools-currency-amount-input>
                </div>`
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
              label="${translate('GENERAL.TOTAL')} (${this.currency})"
              .value="${this.getTotalValue()}"
            ></paper-input>
          </div>
        </div>

        <div class="layout-horizontal input-level">
          <paper-toggle-button
            ?checked="${this.useInputLevel}"
            @checked-changed="${this.inputLevelChange}"
            class="col-5"
            ?disabled="${this.readonly}"
          >
            ${translate('USE_INPUT_LEVEL')}
          </paper-toggle-button>
        </div>
        <activity-items-table
          .dialogElement=${this.dialogElement}
          ?hidden="${!this.useInputLevel}"
          .activityItems="${this.items || []}"
          .currency="${this.currency}"
          .readonly="${this.readonly}"
          @activity-items-changed="${({detail}: CustomEvent) => {
            this.items = detail;
            this.requestUpdate();
          }}"
        ></activity-items-table>
      </etools-dialog>
    `;
  }

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {activity, interventionId, readonly}: any = data;
    this.items = (activity.items || []).filter((row: ManagementBudgetItem) => row.kind === activity.kind);
    this.useInputLevel = Boolean((this.items || []).length);
    this.readonly = readonly;

    setTimeout(() => {
      // timeout to avoid inputLevelChange method reseting totals to 0
      this.data = activity;
      this.data.items = (this.data.items || []).filter((row: ManagementBudgetItem) => row.kind !== this.data.kind);
      this.originalData = cloneDeep(this.data);
      this.data[this.getPropertyName('partner')] = this.data.partner_contribution; // ?
      this.data[this.getPropertyName('unicef')] = this.data.unicef_cash; // ?
      this.interventionId = interventionId;
      this.currency = data.currency || '';
    });
  }

  private interventionId = '';

  @property() loadingInProcess = false;
  @property() dialogOpened = true;
  @property() useInputLevel = false;
  @property({type: String}) currency = '';
  @property({type: Array}) items: ManagementBudgetItem[] = [];
  @property({type: Boolean}) readonly = false;
  @query('etools-dialog') private dialogElement!: EtoolsDialog;
  @query('activity-items-table') private activityItemsTable!: ActivityItemsTable;

  valdateNonInputLevFields() {
    const pCash = this.shadowRoot?.querySelector<EtoolsCurrencyAmountInput>('#partnerContribution')!;
    const uCash = this.shadowRoot?.querySelector<EtoolsCurrencyAmountInput>('#unicefCash')!;
    return pCash.validate() && uCash.validate();
  }

  validate() {
    if (!this.useInputLevel) {
      if (!this.valdateNonInputLevFields()) {
        fireEvent(this, 'toast', {text: getTranslation('REQUIRED_ERROR')});
        return false;
      }
    } else {
      const activityItemsValidationSummary = this.validateActivityItems();
      if (activityItemsValidationSummary) {
        fireEvent(this, 'toast', {
          text: activityItemsValidationSummary.invalidRequired
            ? getTranslation('FILL_ALL_ACTIVITY_ITEMS')
            : getTranslation('INVALID_TOTAL_ACTIVITY_ITEMS')
        });
        return false;
      }
    }
    return true;
  }

  onSaveClick() {
    if (!this.validate()) {
      return;
    }

    this.items.forEach((row: ManagementBudgetItem) => {
      row.kind = this.data.kind;
    });
    this.loadingInProcess = true;

    const patchData = cloneDeep(this.data);
    patchData.items = patchData.items.concat(this.items);
    this.formatDataBeforeSave(patchData);
    sendRequest({
      endpoint: getEndpoint(interventionEndpoints.interventionBudgetUpdate, {
        interventionId: this.interventionId
      }),
      method: 'PATCH',
      body: patchData
    })
      .then(({intervention}) => {
        getStore().dispatch(updateCurrentIntervention(intervention));
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch((error: any) => {
        this.loadingInProcess = false;
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      });
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  getPropertyName(sufix: string) {
    return this.originalData ? `act${this.originalData.index}_${sufix}` : '';
  }

  inputLevelChange(e: CustomEvent): void {
    if (!e.detail) {
      return;
    }
    const element = e.currentTarget as HTMLInputElement;
    this.useInputLevel = element.checked;
    if (this.useInputLevel) {
      this.data[this.getPropertyName('unicef')] = '0';
      this.data[this.getPropertyName('partner')] = '0';
      if ((!this.items || !this.items.length) && this.activityItemsTable) {
        // add by default a row in activity items table if we have none
        setTimeout(() => {
          this.activityItemsTable.addNew();
        }, 100);
      }
    } else {
      this.items = [];
    }
  }

  getSumValue(field: 'cso_cash' | 'unicef_cash'): string {
    const total = (this.items || []).reduce((sum: number, item: AnyObject) => sum + Number(item[field]), 0);
    return displayCurrencyAmount(String(total), '0', 2);
  }

  getTotalValue(): string {
    if (!this.useInputLevel) {
      return getTotal(this.data[this.getPropertyName('partner')] || 0, this.data[this.getPropertyName('unicef')] || 0);
    } else {
      const cso: string = this.getSumValue('cso_cash').replace(/,/g, '');
      const unicef: string = this.getSumValue('unicef_cash').replace(/,/g, '');
      return getTotal(cso, unicef);
    }
  }

  validateActivityItems(): AnyObject | undefined {
    const itemsTable: ActivityItemsTable | null = this.shadowRoot!.querySelector('activity-items-table');
    return itemsTable !== null ? itemsTable.validate() : undefined;
  }

  formatDataBeforeSave(data: any) {
    [this.getPropertyName('unicef'), this.getPropertyName('partner')].forEach((prop) => {
      data[prop] = removeCurrencyAmountDelimiter(data[prop]);
    });
  }
}
