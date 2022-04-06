import {Intervention} from '@unicef-polymer/etools-types';
import {Constructor} from '@unicef-polymer/etools-types/dist/global.types';
import '@polymer/paper-input/paper-input';
import {html, LitElement} from 'lit-element';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {InterventionActivityExtended, InterventionActivityItemExtended} from './types';
import {repeat} from 'lit-html/directives/repeat';
import '@polymer/paper-input/paper-textarea';
import {translate} from 'lit-translate';

export function ActivityItemsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ActivityItemsClass extends baseClass {
    @property({type: Object})
    intervention!: Intervention;

    @property({type: Object})
    permissions!: {
      edit: {result_links?: boolean};
      required: {result_links?: boolean};
    };

    handleEsc!: (event: KeyboardEvent) => void;

    renderActivityItems(activity: InterventionActivityExtended) {
      if (!activity || !activity.items || !activity.items.length) {
        return '';
      }
      return html`<tbody class="odd">
        <tr ?hidden="${!this.permissions.edit.result_links}" type="add-item">
          <td></td>
          <td tabindex="0">
            <div class="icon" @click="${() => this.addNewItem(activity)}">
              <paper-icon-button icon="add-box"></paper-icon-button> ${translate('ADD_NEW_ITEM')}
            </div>
          </td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        ${repeat(
          activity.items || [],
          (item: InterventionActivityItemExtended) => item.id,
          (item: InterventionActivityItemExtended, itemIndex: number) => html`
            <tr class="activity-items-row ${activity.itemsInEditMode ? '' : 'readonly'}" type="a-item">
              <td>
                <paper-input
                  .noLabelFloat="${!activity.itemsInEditMode}"
                  readonly
                  .value="${item.code || 'N/A'}"
                ></paper-input>
              </td>
              <td tabindex="0">
                <paper-textarea
                  .alwaysFloatLabel="${activity.itemsInEditMode}"
                  .noLabelFloat="${!activity.itemsInEditMode}"
                  input
                  label=${this.getLabel(activity.itemsInEditMode, 'Item Description')}
                  ?readonly="${!activity.itemsInEditMode}"
                  .invalid="${item.invalid?.name}"
                  required
                  error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                  .autoValidate="${item.autovalidate?.name}"
                  @focus="${() => this.setAutoValidate(item, 'name')}"
                  .value="${item.name}"
                  @keydown="${(e: any) => this.handleEsc(e)}"
                  @value-changed="${({detail}: CustomEvent) => this.updateModelValue(item, 'name', detail.value)}"
                ></paper-textarea>
              </td>
              <td tabindex="0">
                <paper-input
                  input
                  .alwaysFloatLabel="${activity.itemsInEditMode}"
                  .noLabelFloat="${!activity.itemsInEditMode}"
                  label=${this.getLabel(activity.itemsInEditMode, 'Unit')}
                  ?readonly="${!activity.itemsInEditMode}"
                  .invalid="${item.invalid?.unit}"
                  required
                  .autoValidate="${item.autovalidate?.unit}"
                  @focus="${() => this.setAutoValidate(item, 'unit')}"
                  error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                  .value="${item.unit}"
                  @keydown="${(e: any) => this.handleEsc(e)}"
                  @value-changed="${({detail}: CustomEvent) => this.updateModelValue(item, 'unit', detail.value)}"
                ></paper-input>
              </td>
              <td tabindex="0">
                <etools-currency-amount-input
                  label=${this.getLabel(activity.itemsInEditMode, 'N. of Units')}
                  .noLabelFloat="${!activity.itemsInEditMode}"
                  input
                  ?readonly="${!activity.itemsInEditMode}"
                  .invalid="${item.invalid?.no_units}"
                  required
                  auto-validate
                  error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                  .value="${item.no_units}"
                  @keydown="${(e: any) => this.handleEsc(e)}"
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
              <td tabindex="0">
                <etools-currency-amount-input
                  label=${this.getLabel(activity.itemsInEditMode, 'Price/Unit')}
                  .noLabelFloat="${!activity.itemsInEditMode}"
                  input
                  ?readonly="${!activity.itemsInEditMode}"
                  .invalid="${item.invalid?.unit_price}"
                  required
                  auto-validate
                  error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                  .value="${item.unit_price}"
                  @keydown="${(e: any) => this.handleEsc(e)}"
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
              <td tabindex="0">
                <etools-currency-amount-input
                  label=${this.getLabel(activity.itemsInEditMode, 'Partner Cash')}
                  .noLabelFloat="${!activity.itemsInEditMode}"
                  input
                  ?readonly="${!activity.itemsInEditMode}"
                  required
                  auto-validate
                  error-message="${translate('INCORRECT_VALUE')}"
                  .invalid="${item.invalid?.cso_cash}"
                  .value="${item.cso_cash}"
                  @keydown="${(e: any) => this.handleEsc(e)}"
                  @value-changed="${({detail}: CustomEvent) => {
                    if (item.cso_cash == detail.value) {
                      return;
                    }
                    item.cso_cash = detail.value;

                    this.updateUnicefCash(item, activity);
                    this.requestUpdate();
                  }}"
                ></etools-currency-amount-input>
              </td>
              <td tabindex="0">
                <etools-currency-amount-input
                  label=${this.getLabel(activity.itemsInEditMode, 'UNICEF Cash')}
                  .noLabelFloat="${!activity.itemsInEditMode}"
                  input
                  ?readonly="${!activity.itemsInEditMode}"
                  required
                  auto-validate
                  error-message="${translate('INCORRECT_VALUE')}"
                  .invalid="${item.invalid?.unicef_cash}"
                  .value="${item.unicef_cash}"
                  @keydown="${(e: any) => this.handleEsc(e)}"
                  @value-changed="${({detail}: CustomEvent) => {
                    if (item.unicef_cash == detail.value) {
                      return;
                    }
                    item.unicef_cash = detail.value;

                    this.updateCsoCash(item, activity);
                    this.requestUpdate();
                  }}"
                ></etools-currency-amount-input>
              </td>
              <td>
                <paper-input
                  readonly
                  .noLabelFloat="${!activity.itemsInEditMode}"
                  .value="${this.getTotalForItem(item.no_units || 0, item.unit_price || 0)}"
                ></paper-input>
              </td>
              <td class="del-item" tabindex="${!activity.itemsInEditMode ? '-1' : '0'}">
                <paper-icon-button
                  id="delItem"
                  icon="delete"
                  tabindex="0"
                  ?hidden="${!activity.itemsInEditMode}"
                  @click="${() => this.removeItem(activity, itemIndex)}"
                ></paper-icon-button>
              </td>
            </tr>
          `
        )}
      </tbody>`;
    }

    removeItem(activity: InterventionActivityExtended, itemIndex: number) {
      activity.items.splice(itemIndex, 1);
      this.requestUpdate();
    }

    getLabel(itemsInEditMode: boolean, label: string) {
      return itemsInEditMode ? label : '';
    }

    setAutoValidate(item: InterventionActivityItemExtended, prop: string) {
      if (!item.autovalidate) {
        item.autovalidate = {};
      }
      item.autovalidate[prop] = true;
      this.requestUpdate();
    }

    updateUnicefCash(item: InterventionActivityItemExtended, activity: InterventionActivityExtended) {
      if (isNaN(Number(item.cso_cash))) {
        return;
      }
      const total = this._getItemTotal(item);
      if (Number(item.cso_cash) > total) {
        item.invalid = {cso_cash: true};
        return;
      } else {
        item.invalid = {cso_cash: false};
      }
      item.unicef_cash = String(total - Number(item.cso_cash));

      this.validateCsoAndUnicefCash(item);

      this.calculateActivityTotals(activity);
    }

    _getItemTotal(item: InterventionActivityItemExtended) {
      let total = Number(item.no_units) * Number(item.unit_price);
      total = Number(total.toFixed(2)); // 1.1*6 =6.0000000000000005
      return total;
    }
    updateCsoCash(item: InterventionActivityItemExtended, activity: InterventionActivityExtended) {
      if (isNaN(Number(item.unicef_cash))) {
        return;
      }
      const total = this._getItemTotal(item);
      if (Number(item.unicef_cash) > total) {
        item.invalid = {unicef_cash: true};
        return;
      } else {
        item.invalid = {unicef_cash: false};
      }
      item.cso_cash = String(total - Number(item.unicef_cash));

      this.validateCsoAndUnicefCash(item);
      this.calculateActivityTotals(activity);
    }

    calculateActivityTotals(activity: InterventionActivityExtended) {
      if (!(activity.items && activity.items.length)) {
        return;
      }
      activity.cso_cash = String(activity.items.reduce((sum: number, item) => sum + Number(item.cso_cash), 0));
      activity.unicef_cash = String(activity.items.reduce((sum: number, item) => sum + Number(item.unicef_cash), 0));
    }

    getTotalForItem(noOfUnits: number, pricePerUnit: number | string) {
      let total = (Number(noOfUnits) || 0) * (Number(pricePerUnit) || 0);
      total = Number(total.toFixed(2));
      return displayCurrencyAmount(String(total), '0', 2);
    }

    validateCsoAndUnicefCash(item: InterventionActivityItemExtended) {
      if (Number(item.no_units) == 0 || Number(item.unit_price) == 0) {
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

    addNewItem(activity: Partial<InterventionActivityExtended>) {
      if (!activity.items) {
        activity.items = [];
      }
      // @ts-ignore
      activity.items?.unshift({name: '', inEditMode: true});
      activity.itemsInEditMode = true;

      this.requestUpdate();
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
