import {Intervention, InterventionActivity, InterventionActivityItem} from '@unicef-polymer/etools-types';
import {Constructor} from '@unicef-polymer/etools-types/dist/global.types';
import '@polymer/paper-input/paper-input';
import {html, LitElement} from 'lit-element';

export function ActivityItemsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ActivityItemsClass extends baseClass {
    @property({type: Object})
    intervention!: Intervention;

    renderActivityItems(activity: InterventionActivity) {
      return html`${activity.items?.map(
        (item: InterventionActivityItem) => html`
          <tbody class="odd">
            <tr class="activity-items-row">
              <td class="v-middle">${item.code || 'N/A'}</td>
              <td>
                <paper-textarea
                  always-float-label
                  label="Item Description"
                  required
                  error-message="This field is required"
                  auto-validate
                  .value="${item.name}"
                  @value-changed="${({detail}: CustomEvent) => this.updateModelValue(item, 'name', detail.value)}"
                ></paper-textarea>
              </td>
              <td>
                <paper-input
                  always-float-label
                  label="Unit"
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
                  label="N. of Units"
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
                  label="Price/Unit"
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
                  label="Partner Cash"
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
                  label="Unicef Cash"
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
              <td class="padd-top-40">
                ${this.intervention.planned_budget.currency}
                ${this.getTotalForItem(item.no_units || 0, item.unit_price || 0)}
              </td>
            </tr>
          </tbody>
        `
      )}`;
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
      const total = Number(item.no_units) * Number(item.unit_price);
      if (Number(item.cso_cash) > total) {
        return;
      }
      item.unicef_cash = String(total - Number(item.cso_cash));
      this.validateCsoAndUnicefCash(item);
    }

    updateCsoCash(item: InterventionActivityItem) {
      if (isNaN(item.unicef_cash)) {
        return;
      }
      const total = Number(item.no_units) * Number(item.unit_price);
      if (Number(item.unicef_cash) > total) {
        return;
      }
      item.cso_cash = String(total - Number(item.unicef_cash));
      this.validateCsoAndUnicefCash(item);
    }

    getTotalForItem(noOfUnits: string, pricePerUnit: string): number {
      return (Number(noOfUnits) || 0) * (Number(pricePerUnit) || 0);
    }

    validateCsoAndUnicefCash(item: InterventionActivityItem) {
      if (item.no_units == 0 || item.unit_price == 0) {
        return;
      }

      const total = (Number(item.no_units) || 0) * (Number(item.unit_price) || 0);
      const sum = (Number(item.cso_cash) || 0) + (Number(item.unicef_cash) || 0);
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
