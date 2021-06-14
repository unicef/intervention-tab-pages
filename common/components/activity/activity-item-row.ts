import {
  customElement,
  LitElement,
  html,
  TemplateResult,
  property,
  CSSResultArray,
  css,
  PropertyValues
} from 'lit-element';
import {getTotal, getMultiplyProduct} from './get-total.helper';
import {ActivityItemsTableInlineStyles, ActivityItemsTableStyles} from './activity-items-table.styles';
import {fireEvent} from '../../../utils/fire-custom-event';
import {InterventionActivityItem} from '@unicef-polymer/etools-types';
import {callClickOnSpacePushListener} from '../../../utils/common-methods';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';
import {translate} from 'lit-translate';

@customElement('activity-item-row')
export class ActivityItemRow extends LitElement {
  static get styles(): CSSResultArray {
    // language=css
    return [
      ActivityItemsTableStyles,
      css`
        iron-icon {
          width: 14px;
          color: var(--secondary-text-color);
          cursor: pointer;
          position: relative;
        }
        iron-icon:hover {
          color: var(--primary-text-color);
        }
      `
    ];
  }

  @property() activityItem: Partial<InterventionActivityItem> = {};
  @property() invalidName = false;
  @property() invalidUnit = false;
  @property() invalidNoUnits = false;
  @property() invalidSum = false;
  @property() readonly: boolean | undefined = false;
  @property() lastItem: boolean | undefined = false;

  protected render(): TemplateResult {
    return this.activityItem
      ? html`
          ${ActivityItemsTableInlineStyles}
          <div class="grid-row">
            <div
              class="grid-cell ${!this.lastItem || !this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('ITEM_DESCRIPTION')}"
            >
              <paper-textarea
                .value="${this.activityItem.name || ''}"
                no-label-float
                placeholder="—"
                id="activityName"
                ?invalid="${this.invalidName}"
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('name', detail.value)}"
                @blur="${() => this.onBlur()}"
                @focus="${() => (this.invalidName = false)}"
                @click="${() => (this.invalidName = false)}"
              ></paper-textarea>
            </div>

            <div
              class="grid-cell ${!this.lastItem || !this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('UNIT')}"
            >
              <paper-input
                .value="${this.activityItem.unit || ''}"
                no-label-float
                placeholder="—"
                id="activityUnit"
                ?readonly="${this.readonly}"
                ?invalid="${this.invalidUnit}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('unit', detail.value)}"
                @blur="${() => this.onBlur()}"
                @focus="${() => (this.invalidUnit = false)}"
                @click="${() => (this.invalidUnit = false)}"
              ></paper-input>
            </div>
            <div
              class="grid-cell end ${!this.lastItem || !this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('NUMBER_UNITS')}"
            >
              <etools-currency-amount-input
                .value="${this.activityItem.no_units || ''}"
                no-label-float
                id="activityNoUnits"
                ?invalid="${this.invalidSum || this.invalidNoUnits}"
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('no_units', detail.value)}"
                @blur="${() => this.onBlur()}"
                @focus="${() => {
                  this.invalidSum = false;
                  this.invalidNoUnits = false;
                }}"
                @click="${() => {
                  this.invalidSum = false;
                  this.invalidNoUnits = false;
                }}"
                no-of-decimals="1"
                error-message=""
              ></etools-currency-amount-input>
            </div>
            <div
              class="grid-cell end ${!this.lastItem || !this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('PRICE_UNIT')}"
            >
              <etools-currency-amount-input
                .value="${this.activityItem.unit_price || 0}"
                no-label-float
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('unit_price', detail.value)}"
                @blur="${() => this.onBlur()}"
                ?invalid="${this.invalidSum}"
                @focus="${() => (this.invalidSum = false)}"
                @click="${() => (this.invalidSum = false)}"
                error-message=""
              ></etools-currency-amount-input>
            </div>
            <div
              class="grid-cell end ${!this.lastItem || !this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('TOTAL_COST')}"
            >
              <span class="total">
                ${getMultiplyProduct(this.activityItem.no_units || 0, this.activityItem.unit_price || 0)}
              </span>
            </div>

            <div
              class="grid-cell end ${!this.lastItem || !this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('PARTNER_CASH')}"
            >
              <etools-currency-amount-input
                .value="${this.activityItem.cso_cash || 0}"
                no-label-float
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('cso_cash', detail.value)}"
                @blur="${() => this.onBlur()}"
                ?invalid="${this.invalidSum}"
                @focus="${() => (this.invalidSum = false)}"
                @click="${() => (this.invalidSum = false)}"
                error-message=""
              ></etools-currency-amount-input>
            </div>
            <div
              class="grid-cell end ${!this.lastItem || !this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('UNICEF_CASH')}"
            >
              <etools-currency-amount-input
                .value="${this.activityItem.unicef_cash || 0}"
                no-label-float
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('unicef_cash', detail.value)}"
                @blur="${() => this.onBlur()}"
                ?invalid="${this.invalidSum}"
                @focus="${() => (this.invalidSum = false)}"
                @click="${() => (this.invalidSum = false)}"
                error-message=""
              ></etools-currency-amount-input>
            </div>
            ${!this.readonly
              ? html`<div class="grid-cell remove" data-col-header-label="${translate('GENERAL.DELETE')}">
                  <iron-icon
                    id="btnRemove"
                    icon="close"
                    tabindex="0"
                    ?hidden="${this.readonly}"
                    @click="${() => this.onRemove()}"
                  ></iron-icon>
                </div>`
              : html`<div class="${!this.lastItem ? 'border' : ''}"></div>`}

            <div
              class="grid-cell last-cell end ${!this.lastItem && this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('TOTAL_CASH')}"
            >
              <span class="total">
                ${getTotal(this.activityItem.cso_cash || 0, this.activityItem.unicef_cash || 0)}
              </span>
            </div>
          </div>
        `
      : html``;
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    callClickOnSpacePushListener(this.shadowRoot!.querySelector('#btnRemove'));
  }

  updateField(field: keyof InterventionActivityItem, value: any): void {
    const original = field === 'name' ? this.activityItem[field] : parseFloat(this.activityItem[field] as string);
    if (original === value) {
      return;
    }
    this.activityItem[field] = value;
    this.requestUpdate();
  }

  onBlur(): void {
    fireEvent(this, 'item-changed', this.activityItem);
  }

  onRemove(): void {
    fireEvent(this, 'remove-item');
  }

  validate(): any {
    this.invalidName = !this.activityItem.name;
    this.invalidUnit = !this.activityItem.unit;
    this.invalidNoUnits = isNaN(parseFloat(String(this.activityItem.no_units)));
    const invalidRequired = this.invalidName || this.invalidUnit || this.invalidNoUnits;
    this.invalidSum = invalidRequired
      ? false
      : getMultiplyProduct(this.activityItem.no_units || 0, this.activityItem.unit_price || 0) !==
        getTotal(this.activityItem.cso_cash || 0, this.activityItem.unicef_cash || 0);

    return {invalidRequired: invalidRequired, invalidSum: this.invalidSum};
  }
}
