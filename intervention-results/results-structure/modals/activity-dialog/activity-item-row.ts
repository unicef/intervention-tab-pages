import {customElement, LitElement, html, TemplateResult, property, CSSResultArray, css} from 'lit-element';
import {InterventionActivityItem} from '../../../../common/models/intervention.types';
import {getTotal} from './get-total.helper';
import {ActivityItemsTableInlineStyles, ActivityItemsTableStyles} from './acivity-items-table.styles';
import {fireEvent} from '../../../../utils/fire-custom-event';

@customElement('activity-item-row')
export class ActivityItemRow extends LitElement {
  static get styles(): CSSResultArray {
    // language=css
    return [
      ActivityItemsTableStyles,
      css`
        iron-icon {
          width: 14px;
          margin-top: 14px;
          color: var(--secondary-text-color);
          cursor: pointer;
        }
        iron-icon:hover {
          color: var(--primary-text-color);
        }
      `
    ];
  }

  @property() activityItem: Partial<InterventionActivityItem> = {};
  @property() invalid = false;
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
                placeholder="Enter description"
                ?invalid="${this.invalid}"
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('name', detail.value)}"
                @blur="${() => this.onBlur()}"
                @focus="${() => (this.invalid = false)}"
                @click="${() => (this.invalid = false)}"
              ></paper-textarea>
            </div>
            <div class="grid-cell center ${!this.lastItem || !this.readonly ? 'border' : ''}">
              <etools-currency-amount-input
                .value="${this.activityItem.cso_cash || 0}"
                no-label-float
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('cso_cash', detail.value)}"
                @blur="${() => this.onBlur()}"
              ></etools-currency-amount-input>
            </div>
            <div class="grid-cell center ${!this.lastItem || !this.readonly ? 'border' : ''}">
              <etools-currency-amount-input
                .value="${this.activityItem.unicef_cash || 0}"
                no-label-float
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => this.updateField('unicef_cash', detail.value)}"
                @blur="${() => this.onBlur()}"
              ></etools-currency-amount-input>
            </div>
            ${!this.readonly
              ? html`<div>
                  <iron-icon icon="close" ?hidden="${this.readonly}" @click="${() => this.onRemove()}"></iron-icon>
                </div>`
              : html`<div class="${!this.lastItem ? 'border' : ''}"></div>`}

            <div class="grid-cell end ${!this.lastItem && this.readonly ? 'border' : ''}">
              ${getTotal(this.activityItem.cso_cash || 0, this.activityItem.unicef_cash || 0)}
            </div>
          </div>
        `
      : html``;
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
    this.invalid = !this.activityItem.name;
    return !this.invalid;
  }
}
