import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {InterventionActivity, InterventionActivityItem} from '@unicef-polymer/etools-types';
import {
  ExpectedResult,
  Intervention,
  ResultLinkLowerResult
} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import {Constructor, html, LitElement, property} from 'lit-element';

export function ActivitiesMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ActivitiesClass extends baseClass {
    @property({type: Array})
    originalResultLink!: ExpectedResult[];

    @property({type: Object})
    intervention!: Intervention;

    renderActivities(pdOutput: ResultLinkLowerResult, resultIndex: number, pdOutputIndex: number) {
      return html`
        ${pdOutput.activities?.map(
          (activity: InterventionActivity, activityIndex: number) => html`
            <thead>
              <tr class="edit">
                <td class="first-col"></td>
                <td colspan="3"></td>
                <td class="col-g"></td>
                <td class="col-g"></td>
                <td class="col-g"></td>
                <td class="col-6">
                  <paper-icon-button
                    icon="create"
                    ?hidden="${activity.inEditMode}"
                    @click="${() => {
                      activity.inEditMode = true;
                      this.requestUpdate();
                    }}"
                  ></paper-icon-button>
                </td>
              </tr>
              <tr class="header">
                <td></td>
                <td colspan="3">Activity</td>
                <td>Time Periods</td>
                <td>CSO Contribution</td>
                <td>UNICEF Cash</td>
                <td>Total</td>
              </tr>
            </thead>
            <tbody>
              <tr class="text">
                <td>${activity.code}</td>
                <td colspan="3">
                  <paper-textarea
                    no-label-float
                    .value="${activity.name}"
                    ?readonly="${!activity.inEditMode}"
                    required
                    .invalid="${activity.invalid}"
                    error-message="This field is required"
                    @value-changed="${({detail}: CustomEvent) => this.updateModelValue(activity, 'name', detail.value)}"
                  ></paper-textarea>
                  <div class="pad-top-8">
                    <paper-textarea
                      placeholder="-"
                      label="Other Notes"
                      always-float-label
                      ?readonly="${!activity.inEditMode}"
                      .value="${activity.context_details}"
                      @value-changed="${({detail}: CustomEvent) =>
                        this.updateModelValue(activity, 'context_details', detail.value)}"
                    ></paper-textarea>
                  </div>
                </td>
                <td></td>
                <td>
                  <etools-currency-amount-input
                    no-label-float
                    .value="${activity.cso_cash}"
                    ?readonly="${!activity.inEditMode}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.updateModelValue(activity, 'cso_cash', detail.value)}"
                  ></etools-currency-amount-input>
                </td>
                <td>
                  <etools-currency-amount-input
                    no-label-float
                    .value="${activity.unicef_cash}"
                    ?readonly="${!activity.inEditMode}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.updateModelValue(activity, 'unicef_cash', detail.value)}"
                  ></etools-currency-amount-input>
                </td>
                <td>
                  ${this.intervention.planned_budget.currency}
                  <span class="b"
                    >${displayCurrencyAmount(String(this.getTotal(activity.cso_cash, activity.unicef_cash)), '0', 2)}
                  </span>
                </td>
              </tr>
              <tr class="add">
                <td></td>
                <td colspan="3">
                  <span ?hidden="${activity.items?.length}">
                    <paper-icon-button icon="add-box" @click="${() => this.addNewItem(activity)}"></paper-icon-button>
                    Add New Item
                  </span>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td class="h-center">
                  <div class="flex-h justify-right" ?hidden="${!(activity.inEditMode || activity.itemsInEditMode)}">
                    <paper-button @click="${() => this.saveActivity(activity)}">Save</paper-button>
                    <paper-icon-button
                      icon="close"
                      @click="${() =>
                        this.cancelActivity(pdOutput.activities, activity, resultIndex, pdOutputIndex, activityIndex)}"
                    ></paper-icon-button>
                  </div>
                </td>
              </tr>
            </tbody>

            <thead ?hidden="${!activity.items || !activity.items.length}">
              <tr class="header border-b">
                <td class="first-col"></td>
                <td class="col-30">Item Description</td>
                <td class="col-10">Unit</td>
                <td class="col-10">Number Of Units</td>
                <td class="col-g">Price/Unit</td>
                <td class="col-g">Partner Cash</td>
                <td class="col-g">UNICEF CASH</td>
                <td class="col-g">Total</td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <paper-icon-button icon="add-box" @click="${() => this.addNewItem(activity)}"></paper-icon-button> Add
                  New Item
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </thead>
            ${activity.items?.map(
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
                      ></paper-textarea>
                    </td>
                    <td>
                      <paper-input
                        always-float-label
                        label="Unit"
                        required
                        auto-validate
                        .value="${item.unit}"
                      ></paper-input>
                    </td>
                    <td>
                      <etools-currency-amount-input
                        label="N. of Units"
                        required
                        auto-validate
                        .value="${item.no_units}"
                      ></etools-currency-amount-input>
                    </td>
                    <td>
                      <etools-currency-amount-input
                        label="Price/Unit"
                        required
                        auto-validate
                        .value="${item.unit_price}"
                      ></etools-currency-amount-input>
                    </td>
                    <td>
                      <etools-currency-amount-input
                        label="Partner Cash"
                        required
                        auto-validate
                        .value="${item.cso_cash}"
                      ></etools-currency-amount-input>
                    </td>
                    <td>
                      <etools-currency-amount-input
                        label="Total"
                        required
                        auto-validate
                        .value="${item.unicef_cash}"
                      ></etools-currency-amount-input>
                    </td>
                    <td class="padd-top-40">
                      ${this.intervention.planned_budget.currency}
                      ${this.getTotal(item.cso_cash || 0, item.unicef_cash || 0)}
                    </td>
                  </tr>
                </tbody>
              `
            )}
          `
        )}
      `;
    }

    getTotal(partner: string, unicef: string): number {
      return (Number(partner) || 0) + (Number(unicef) || 0);
    }

    cancelActivity(
      activities: Partial<InterventionActivity>[],
      activity: InterventionActivity,
      resultIndex: number,
      pdOutputIndex: number,
      activityIndex: number
    ) {
      if (!activity.id) {
        activities.shift();
      } else {
        Object.assign(
          activity,
          this.originalResultLink[resultIndex].ll_results[pdOutputIndex].activities[activityIndex]
        );
      }
      activity.invalid = false;
      activity.inEditMode = false;

      this.requestUpdate();
    }
    updateModelValue(model: any, property: string, newVal: any) {
      if (newVal == model[property]) {
        return;
      }
      model[property] = newVal;
      this.requestUpdate();
    }

    addNewItem(activity: Partial<InterventionActivity>) {
      if (!activity.items) {
        activity.items = [];
      }
      activity.items?.unshift({name: '', inEditMode: true});
      activity.itemsInEditMode = true;
      this.requestUpdate();
    }

    saveActivity(activity: InterventionActivity) {}
  };
}
