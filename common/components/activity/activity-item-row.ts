import {LitElement, html, TemplateResult, CSSResultArray, css, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {getTotalCashFormatted, getMultiplyProductCashFormatted} from './get-total.helper';
import {ActivityItemsTableInlineStyles, ActivityItemsTableStyles} from './activity-items-table.styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {InterventionActivityItem} from '@unicef-polymer/etools-types';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {callClickOnSpacePushListener} from '@unicef-polymer/etools-utils/dist/accessibility.util';
import {ActivitiesCommonMixin} from '../../mixins/activities-common.mixin';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input.js';

@customElement('activity-item-row')
export class ActivityItemRow extends ActivitiesCommonMixin(LitElement) {
  static get styles(): CSSResultArray {
    // language=css
    return [
      ActivityItemsTableStyles,
      css`
        etools-icon {
          --etools-icon-font-size: var(--etools-font-size-14, 14px);
          color: var(--secondary-text-color);
          cursor: pointer;
          position: relative;
        }
        etools-icon:hover {
          color: var(--primary-text-color);
        }
        etools-textarea {
          --etools-input-padding-bottom: 3px;
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
  @property({type: String})
  currency = '';

  protected render(): TemplateResult {
    return this.activityItem
      ? html`
          ${ActivityItemsTableInlineStyles}
          <div class="grid-row">
            <div
              class="grid-cell ${!this.lastItem || !this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('ITEM_DESCRIPTION')}"
            >
              <etools-textarea
                .value="${this.activityItem.name || ''}"
                no-label-float
                placeholder="—"
                id="activityName"
                ?invalid="${this.invalidName}"
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'name', this.activityItem)}"
                @blur="${() => this.onBlur()}"
                @focus="${() => (this.invalidName = false)}"
                @click="${() => (this.invalidName = false)}"
              ></etools-textarea>
            </div>

            <div
              class="grid-cell ${!this.lastItem || !this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('UNIT')}"
            >
              <etools-input
                .value="${this.activityItem.unit || ''}"
                no-label-float
                placeholder="—"
                id="activityUnit"
                ?readonly="${this.readonly}"
                ?invalid="${this.invalidUnit}"
                @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'unit', this.activityItem)}"
                @blur="${() => this.onBlur()}"
                @focus="${() => (this.invalidUnit = false)}"
                @click="${() => (this.invalidUnit = false)}"
                error-message=""
              ></etools-input>
            </div>
            <div
              class="grid-cell end ${!this.lastItem || !this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('NUMBER_UNITS')}"
            >
              <etools-currency
                .value="${this.activityItem.no_units || ''}"
                no-label-float
                id="activityNoUnits"
                ?invalid="${this.invalidSum || this.invalidNoUnits}"
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.numberChanged(detail, 'no_units', this.activityItem)}"
                @blur="${() => this.onBlur()}"
                @focus="${() => {
                  this.invalidSum = false;
                  this.invalidNoUnits = false;
                }}"
                @click="${() => {
                  this.invalidSum = false;
                  this.invalidNoUnits = false;
                }}"
                no-of-decimals="2"
                error-message=""
              ></etools-currency>
            </div>
            <div
              class="grid-cell end ${!this.lastItem || !this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('PRICE_UNIT')}"
            >
              <etools-currency
                .value="${this.activityItem.unit_price || 0}"
                no-label-float
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) =>
                  this.numberChanged(detail, 'unit_price', this.activityItem)}"
                @blur="${() => this.onBlur()}"
                ?invalid="${this.invalidSum}"
                @focus="${() => (this.invalidSum = false)}"
                @click="${() => (this.invalidSum = false)}"
                error-message=""
              ></etools-currency>
            </div>

            <div
              class="grid-cell end ${!this.lastItem || !this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('PARTNER_CASH')}"
            >
              <etools-currency
                .value="${this.activityItem.cso_cash || 0}"
                no-label-float
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) =>
                  this.cashFieldChanged(detail, 'cso_cash', this.activityItem)}"
                @blur="${() => this.onBlur()}"
                ?invalid="${this.invalidSum}"
                @focus="${() => (this.invalidSum = false)}"
                @click="${() => (this.invalidSum = false)}"
                error-message=""
              ></etools-currency>
            </div>
            <div
              class="grid-cell end ${!this.lastItem || !this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('UNICEF_CASH')}"
            >
              <etools-currency
                .value="${this.activityItem.unicef_cash || 0}"
                no-label-float
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) =>
                  this.cashFieldChanged(detail, 'unicef_cash', this.activityItem)}"
                @blur="${() => this.onBlur()}"
                ?invalid="${this.invalidSum}"
                @focus="${() => (this.invalidSum = false)}"
                @click="${() => (this.invalidSum = false)}"
                error-message=""
              ></etools-currency>
            </div>
            <div
              class="grid-cell last-cell end ${!this.lastItem && this.readonly ? 'border' : ''}"
              data-col-header-label="${translate('TOTAL_CASH')} (${this.currency})"
            >
              <span class="total">
                ${getMultiplyProductCashFormatted(this.activityItem.no_units || 0, this.activityItem.unit_price || 0)}
              </span>
            </div>
            ${!this.readonly
              ? html`<div class="grid-cell end remove" data-col-header-label="${translate('GENERAL.DELETE')}">
                  <etools-icon
                    id="btnRemove"
                    name="close"
                    tabindex="0"
                    ?hidden="${this.readonly}"
                    @click="${() => this.onRemove()}"
                  ></etools-icon>
                </div>`
              : html`<div class="${!this.lastItem ? 'border' : ''}"></div>`}
          </div>
        `
      : html``;
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    callClickOnSpacePushListener(this.shadowRoot!.querySelector('#btnRemove'));
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
      : getMultiplyProductCashFormatted(this.activityItem.no_units || 0, this.activityItem.unit_price || 0) !==
        getTotalCashFormatted(this.activityItem.cso_cash || 0, this.activityItem.unicef_cash || 0);

    return {invalidRequired: invalidRequired, invalidSum: this.invalidSum};
  }
}
