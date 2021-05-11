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
import {ActivityItemsTableInlineStyles, ActivityItemsTableStyles} from './acivity-items-table.styles';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {InterventionActivityItem} from '@unicef-polymer/etools-types';
import {callClickOnSpacePushListener} from '../../../../utils/common-methods';

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
          top: 50%;
          transform: translateY(-50%);
        }
        iron-icon:hover {
          color: var(--primary-text-color);
        }
      `
    ];
  }

  @property() activityItem: Partial<InterventionActivityItem> = {};
  @property() invalidName = false;
  @property() invalidSums = false;
  @property() readonly: boolean | undefined = false;
  @property() lastItem: boolean | undefined = false;

  protected render(): TemplateResult {
    return this.activityItem
      ? html`
          ${ActivityItemsTableInlineStyles}
          <div class="grid-row">
            <div class="grid-cell ${!this.lastItem || !this.readonly ? 'border' : ''}">
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

            <div class="grid-cell ${!this.lastItem || !this.readonly ? 'border' : ''}">
              <paper-input
                .value="${this.activityItem.unit_name || ''}"
                no-label-float
                placeholder="—"
                id="activityName"
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('unit_name', detail.value)}"
                @blur="${() => this.onBlur()}"
              ></paper-input>
            </div>
            <div class="grid-cell center ${!this.lastItem || !this.readonly ? 'border' : ''}">
              <paper-input
                .value="${this.activityItem.unit_number || ''}"
                no-label-float
                allowed-pattern="[0-9]"
                placeholder="—"
                id="unit_number"
                ?invalid="${this.invalidSums}"
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('unit_number', detail.value)}"
                @blur="${() => this.onBlur()}"
                @focus="${() => (this.invalidSums = false)}"
                @click="${() => (this.invalidSums = false)}"
              ></paper-input>
            </div>
            <div class="grid-cell center ${!this.lastItem || !this.readonly ? 'border' : ''}">
              <etools-currency-amount-input
                .value="${this.activityItem.unit_price || 0}"
                no-label-float
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('unit_price', detail.value)}"
                @blur="${() => this.onBlur()}"
                ?invalid="${this.invalidSums}"
                @focus="${() => (this.invalidSums = false)}"
                @click="${() => (this.invalidSums = false)}"
                error-message=""
              ></etools-currency-amount-input>
            </div>
            <div class="grid-cell end ${!this.lastItem || !this.readonly ? 'border' : ''}">
              ${getMultiplyProduct(this.activityItem.unit_number || 0, this.activityItem.unit_price || 0)}
            </div>

            <div class="grid-cell center ${!this.lastItem || !this.readonly ? 'border' : ''}">
              <etools-currency-amount-input
                .value="${this.activityItem.cso_cash || 0}"
                no-label-float
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('cso_cash', detail.value)}"
                @blur="${() => this.onBlur()}"
                ?invalid="${this.invalidSums}"
                @focus="${() => (this.invalidSums = false)}"
                @click="${() => (this.invalidSums = false)}"
                error-message=""
              ></etools-currency-amount-input>
            </div>
            <div class="grid-cell center ${!this.lastItem || !this.readonly ? 'border' : ''}">
              <etools-currency-amount-input
                .value="${this.activityItem.unicef_cash || 0}"
                no-label-float
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('unicef_cash', detail.value)}"
                @blur="${() => this.onBlur()}"
                ?invalid="${this.invalidSums}"
                @focus="${() => (this.invalidSums = false)}"
                @click="${() => (this.invalidSums = false)}"
                error-message=""
              ></etools-currency-amount-input>
            </div>
            ${!this.readonly
              ? html`<div>
                  <iron-icon
                    id="btnRemove"
                    icon="close"
                    tabindex="0"
                    ?hidden="${this.readonly}"
                    @click="${() => this.onRemove()}"
                  ></iron-icon>
                </div>`
              : html`<div class="${!this.lastItem ? 'border' : ''}"></div>`}

            <div class="grid-cell end ${!this.lastItem && this.readonly ? 'border' : ''}">
              ${getTotal(this.activityItem.cso_cash || 0, this.activityItem.unicef_cash || 0)}
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

  validate(): boolean {
    this.invalidName = !this.activityItem.name;
    this.invalidSums = getMultiplyProduct(this.activityItem.unit_number || 0, this.activityItem.unit_price || 0) !==
    getTotal(this.activityItem.cso_cash || 0, this.activityItem.unicef_cash || 0);

    return !this.invalidName && !this.invalidSums;
  }
}
