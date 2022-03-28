import {Intervention, InterventionActivity, InterventionActivityItem} from '@unicef-polymer/etools-types';
import {Constructor} from '@unicef-polymer/etools-types/dist/global.types';
import '@polymer/paper-input/paper-input';
import {html, LitElement} from 'lit-element';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';

export function ActivityItemsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ActivityItemsClass extends baseClass {
    @property({type: Object})
    intervention!: Intervention;

    renderActivityItems(activity: InterventionActivity) {
      if (!activity.items) {
        return '';
      }
      return html`<tbody class="odd">
        ${activity.items?.map(
          (item: InterventionActivityItem) => html`
            <tr class="activity-items-row">
              <td class="v-middle">${item.code || 'N/A'}</td>
              <td>
                <paper-textarea
                  always-float-label
                  label=${this.getLabel(activity.itemsInEditMode, 'Item Description')}
                  ?readonly="${!activity.itemsInEditMode}"
                  .invalid="${item.invalid?.name}"
                  required
                  error-message="This field is required"
                  .autoValidate="${item.autovalidate?.name}"
                  @focus="${() => this.setAutoValidate(item, 'name')}"
                  .value="${item.name}"
                  @value-changed="${({detail}: CustomEvent) => this.updateModelValue(item, 'name', detail.value)}"
                ></paper-textarea>
              </td>
              <td>
                <paper-input
                  always-float-label
                  label=${this.getLabel(activity.itemsInEditMode, 'Unit')}
                  ?readonly="${!activity.itemsInEditMode}"
                  .invalid="${item.invalid?.unit}"
                  required
                  .autoValidate="${item.autovalidate?.unit}"
                  @focus="${() => this.setAutoValidate(item, 'unit')}"
                  error-message="This field is required"
                  .value="${item.unit}"
                  @value-changed="${({detail}: CustomEvent) => this.updateModelValue(item, 'unit', detail.value)}"
                ></paper-input>
              </td>
              <td>
                <etools-currency-amount-input
                  label=${this.getLabel(activity.itemsInEditMode, 'N. of Units')}
                  ?readonly="${!activity.itemsInEditMode}"
                  .invalid="${item.invalid?.no_units}"
                  required
                  auto-validate
                  error-message="This field is required"
                  .value="${item.no_units}"
                  @value-changed="${({detail}: CustomEvent) => {
                    if (item.no_units == detail.value) {
                      return;
                    }
                    item.no_units = detail.value;
                    this.validateCsoAndUnicefCash(item);
                    this.requestUpdate();
                  }}"
                ></etools-currency-amount-input>
              </td>
              <td>
                <etools-currency-amount-input
                  label=${this.getLabel(activity.itemsInEditMode, 'Price/Unit')}
                  ?readonly="${!activity.itemsInEditMode}"
                  .invalid="${item.invalid?.unit_price}"
                  required
                  auto-validate
                  error-message="This field is required"
                  .value="${item.unit_price}"
                  @value-changed="${({detail}: CustomEvent) => {
                    if (item.unit_price == detail.value) {
                      return;
                    }
                    item.unit_price = detail.value;
                    this.validateCsoAndUnicefCash(item);
                    this.requestUpdate();
                  }}"
                ></etools-currency-amount-input>
              </td>
              <td>
                <etools-currency-amount-input
                  label=${this.getLabel(activity.itemsInEditMode, 'Partner Cash')}
                  ?readonly="${!activity.itemsInEditMode}"
                  required
                  auto-validate
                  error-message="Incorrect value"
                  .invalid="${item.invalid?.cso_cash}"
                  .value="${item.cso_cash}"
                  @value-changed="${({detail}: CustomEvent) => {
                    if (item.cso_cash == detail.value) {
                      return;
                    }
                    item.cso_cash = detail.value;

                    this.updateUnicefCash(item);
                    this.requestUpdate();
                  }}"
                ></etools-currency-amount-input>
              </td>
              <td>
                <etools-currency-amount-input
                  label=${this.getLabel(activity.itemsInEditMode, 'UNICEF Cash')}
                  ?readonly="${!activity.itemsInEditMode}"
                  required
                  auto-validate
                  error-message="Incorrect value"
                  .invalid="${item.invalid?.unicef_cash}"
                  .value="${item.unicef_cash}"
                  @value-changed="${({detail}: CustomEvent) => {
                    if (item.unicef_cash == detail.value) {
                      return;
                    }
                    item.unicef_cash = detail.value;

                    this.updateCsoCash(item);
                    this.requestUpdate();
                  }}"
                ></etools-currency-amount-input>
              </td>
              <td class="l-height-61">${this.getTotalForItem(item.no_units || 0, item.unit_price || 0)}</td>
            </tr>
          `
        )}
      </tbody>`;
    }

    getLabel(itemsInEditMode: boolean, label: string) {
      return itemsInEditMode ? label : '';
    }

    setAutoValidate(item: InterventionActivityItem, prop: string) {
      if (!item.autovalidate) {
        item.autovalidate = {};
      }
      item.autovalidate[prop] = true;
      this.requestUpdate();
    }

    updateUnicefCash(item: InterventionActivityItem) {
      if (isNaN(item.cso_cash)) {
        return;
      }
      let total = Number(item.no_units) * Number(item.unit_price);
      total = Number(total.toFixed(2)); // 1.1*6 =6.0000000000000005
      if (Number(item.cso_cash) > total) {
        item.invalid.cso_cash = true;
        return;
      } else {
        item.invalid.cso_cash = false;
      }
      item.unicef_cash = String(total - Number(item.cso_cash));
      this.validateCsoAndUnicefCash(item);
    }

    updateCsoCash(item: InterventionActivityItem) {
      if (isNaN(item.unicef_cash)) {
        return;
      }
      let total = Number(item.no_units) * Number(item.unit_price);
      total = Number(total.toFixed(2));
      if (Number(item.unicef_cash) > total) {
        item.invalid.unicef_cash = true;
        return;
      } else {
        item.invalid.unicef_cash = false;
      }
      item.cso_cash = String(total - Number(item.unicef_cash));
      this.validateCsoAndUnicefCash(item);
    }

    getTotalForItem(noOfUnits: string, pricePerUnit: string) {
      let total = (Number(noOfUnits) || 0) * (Number(pricePerUnit) || 0);
      total = Number(total.toFixed(2));
      return displayCurrencyAmount(String(total), '0', 2);
    }

    validateCsoAndUnicefCash(item: InterventionActivityItem) {
      if (item.no_units == 0 || item.unit_price == 0) {
        return;
      }

      let total = (Number(item.no_units) || 0) * (Number(item.unit_price) || 0);
      total = Number(total.toFixed(2));
      let sum = (Number(item.cso_cash) || 0) + (Number(item.unicef_cash) || 0);
      sum = Number(sum.toFixed(2));
      if (total != sum) {
        item.invalid = {...item.invalid, ...{cso_cash: true, unicef_cash: true}};
      } else {
        item.invalid = {...item.invalid, ...{cso_cash: false, unicef_cash: false}};
      }
    }

    updateModelValue(model: any, property: string, newVal: any) {
      if (newVal == model[property]) {
        return;
      }
      model[property] = newVal;
      this.requestUpdate();
    }
  };
}
