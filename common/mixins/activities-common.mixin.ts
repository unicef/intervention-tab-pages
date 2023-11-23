import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {Constructor, InterventionActivityItem} from '@unicef-polymer/etools-types';
import {LitElement} from 'lit';
import {getItemTotal} from '../components/activity/get-total.helper';

export function ActivitiesCommonMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ActivitiesCommonClass extends ModelChangedMixin(baseClass) {
    cashFieldChanged(
      detail: {value: any},
      field: 'unicef_cash' | 'cso_cash',
      item: Partial<InterventionActivityItem>
    ): void {
      this.numberChanged(detail, field, item);
      if (!item.unit_price || !item.no_units) {
        return;
      }
      const secondCashField = field === 'unicef_cash' ? 'cso_cash' : 'unicef_cash';
      const total = getItemTotal(item);
      const value = Number(Math.max(0, total - detail.value).toFixed(2)); // in js 12019.15-11130 = 889.1499999999996
      this.numberChanged({value}, secondCashField, item);
    }

    activityItemInvalidChanged(detail: {value: any}, field: string, item: any) {
      if (item.invalid && item.invalid[field] != detail.value) {
        item.invalid = {...item.invalid, [field]: detail.value};
      }
    }

    isReadonlyCash(inEditMode: boolean, items?: any[]) {
      if (!inEditMode) {
        return true;
      } else {
        if (items && items.length) {
          return true;
        } else {
          return false;
        }
      }
    }

    isRequiredCash(inEditMode: boolean, items?: any[]) {
      return inEditMode && !(items && items.length);
    }

    validateActivityItems(activity: any) {
      if (!activity.items || !activity.items.length) {
        return true;
      }

      let invalid = false;
      activity.items.forEach((item: any) => {
        item.invalid = {};
        item.invalid.name = !item.name;
        item.invalid.unit = !item.unit;
        item.invalid.no_units = !item.no_units || Number(item.no_units) == 0;
        // item.invalid.unit_price = !item.unit_price || Number(item.unit_price) == 0;
        if (item.no_units && item.unit_price) {
          this.validateCsoAndUnicefCashForItem(item);
        }
        if (Object.values(item.invalid).some((val: any) => val === true)) {
          invalid = true;
        }
      });
      return !invalid;
    }

    validateCsoAndUnicefCashForItem(item: any) {
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
        item.invalid = {
          ...item.invalid,
          ...{
            cso_cash: item.cso_cash === null || item.cso_cash === undefined || isNaN(item.cso_cash),
            unicef_cash: item.unicef_cash === null || item.unicef_cash === undefined || isNaN(item.unicef_cash)
          }
        };
      }
    }

    resetItemsValidations(activity: any) {
      if (!activity.items || !activity.items.length) {
        return;
      }

      activity.items.forEach((i: any) => {
        i.invalid = {
          name: false,
          unit: false,
          no_units: false,
          unit_price: false,
          cso_cash: false,
          unicef_cash: false
        };
      });
    }

    updateActivityCashFromItem(activity: any, item: any) {
      this.validateCsoAndUnicefCashForItem(item);
      this.calculateActivityTotals(activity);
      this.requestUpdate();
    }

    calculateActivityTotals(activity: any) {
      if (!(activity.items && activity.items.length)) {
        return;
      }
      activity.cso_cash = String(
        activity.items.reduce((sum: number, item: {cso_cash: any}) => sum + Number(item.cso_cash), 0)
      );
      activity.unicef_cash = String(
        activity.items.reduce((sum: number, item: {unicef_cash: any}) => sum + Number(item.unicef_cash), 0)
      );
    }
  };
}
