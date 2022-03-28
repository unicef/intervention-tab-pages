import {Constructor, html, LitElement, property} from 'lit-element';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {InterventionQuarter} from '@unicef-polymer/etools-types';
import {Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import '../time-intervals/time-intervals';
import {cloneDeep, isJsonStrMatch} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {ActivityItemsMixin} from './activity-item-mixin';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {updateCurrentIntervention} from '../../common/actions/interventions';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {repeat} from 'lit-html/directives/repeat';
import {
  ExpectedResultExtended,
  InterventionActivityExtended,
  InterventionActivityItemExtended,
  ResultLinkLowerResultExtended
} from './types';

export function ActivitiesMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ActivitiesClass extends ActivityItemsMixin(baseClass) {
    @property({type: Array})
    originalResultStructureDetails!: ExpectedResultExtended[];

    @property({type: Object})
    intervention!: Intervention;

    refreshResultStructure = false;
    quarters: InterventionQuarter[] = [];

    renderActivities(pdOutput: ResultLinkLowerResultExtended, resultIndex: number, pdOutputIndex: number) {
      return html`
        ${repeat(
          pdOutput.activities,
          (pdOutput: ResultLinkLowerResultExtended) => pdOutput.id,
          (activity: InterventionActivityExtended, activityIndex: number) => html`
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
                      activity.itemsInEditMode = true;
                      this.requestUpdate();
                    }}"
                  ></paper-icon-button>
                </td>
              </tr>
              <tr class="header">
                <td></td>
                <td colspan="3">Activity</td>
                <td class="a-right">Time Periods</td>
                <td>CSO Contribution</td>
                <td>UNICEF Cash</td>
                <td>Total</td>
              </tr>
            </thead>
            <tbody comment-element="activity-${activity.id}" comment-description=" Activity - ${activity.name}">
              <tr class="text">
                <td>${activity.code}</td>
                <td colspan="3">
                  <paper-textarea
                    no-label-float
                    .value="${activity.name}"
                    ?readonly="${!activity.inEditMode}"
                    required
                    .invalid="${activity.invalid?.name}"
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
                <td>
                  <div class="flex-h justify-right">
                    <time-intervals
                      tabindex="0"
                      .invalid="${activity.invalid?.time_frames}"
                      .quarters="${this.quarters}"
                      .selectedTimeFrames="${activity.time_frames}"
                      @intervals-changed="${(event: CustomEvent) => {
                        if (event.detail == undefined) {
                          return;
                        }
                        if (isJsonStrMatch(activity.time_frames, event.detail)) {
                          return;
                        }
                        activity.time_frames = event.detail;
                        this.requestUpdate();
                      }}"
                    ></time-intervals>
                  </div>
                </td>
                <td>
                  <etools-currency-amount-input
                    no-label-float
                    .value="${activity.cso_cash}"
                    ?readonly="${this.isReadonlyForActivityCash(activity.inEditMode, activity.items)}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.updateModelValue(activity, 'cso_cash', detail.value)}"
                  ></etools-currency-amount-input>
                </td>
                <td>
                  <etools-currency-amount-input
                    no-label-float
                    .value="${activity.unicef_cash}"
                    ?readonly="${this.isReadonlyForActivityCash(activity.inEditMode, activity.items)}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.updateModelValue(activity, 'unicef_cash', detail.value)}"
                  ></etools-currency-amount-input>
                </td>
                <td>
                  ${this.intervention.planned_budget.currency}
                  <span class="b"
                    >${displayCurrencyAmount(
                      String(this.getTotalForActivity(activity.cso_cash, activity.unicef_cash)),
                      '0',
                      2
                    )}
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
                    <paper-button @click="${() => this.saveActivity(activity, pdOutput.id, this.intervention.id)}"
                      >Save</paper-button
                    >
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
                <td class="col-g">Total (${this.intervention.planned_budget.currency})</td>
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
            ${this.renderActivityItems(activity)}
          `
        )}
      `;
    }

    getTotalForActivity(partner: string, unicef: string): number {
      return (Number(partner) || 0) + (Number(unicef) || 0);
    }

    cancelActivity(
      activities: Partial<InterventionActivityExtended>[],
      activity: InterventionActivityExtended,
      resultIndex: number,
      pdOutputIndex: number,
      activityIndex: number
    ) {
      if (!activity.id) {
        activities.shift();
      } else {
        Object.assign(
          activity,
          this.originalResultStructureDetails[resultIndex].ll_results[pdOutputIndex].activities[activityIndex]
        );
      }
      activity.invalid = {name: false, context_details: false, time_frames: false};
      activity.inEditMode = false;
      activity.itemsInEditMode = false;

      this.requestUpdate();
    }
    updateModelValue(model: any, property: string, newVal: any) {
      if (newVal == model[property]) {
        return;
      }
      model[property] = newVal;
      this.requestUpdate();
    }

    addNewItem(activity: Partial<InterventionActivityExtended>) {
      if (!activity.items) {
        activity.items = [];
      }
      activity.items?.unshift({name: '', inEditMode: true});
      activity.itemsInEditMode = true;

      this.requestUpdate();
    }

    isReadonlyForActivityCash(inEditMode: boolean, items?: InterventionActivityItemExtended[]) {
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

    validateActivity(activity: InterventionActivityExtended) {
      activity.invalid = {};
      if (!activity.name) {
        activity.invalid.name = true;
      }
      if (this.quarters && this.quarters.length) {
        if (!(activity.time_frames && activity.time_frames.length)) {
          activity.invalid.time_frames = true;
        }
      }
      return !Object.keys(activity.invalid).length;
    }
    validateActivityItems(activity: InterventionActivityExtended) {
      if (!activity.items || !activity.items.length) {
        return true;
      }

      let invalid = false;
      activity.items.forEach((item: InterventionActivityItemExtended) => {
        item.invalid = {};
        item.invalid.name = !item.name;
        item.invalid.no_units = !item.no_units;
        item.invalid.unit_price = !item.unit_price;
        if (item.no_units && item.unit_price) {
          this.validateCsoAndUnicefCash(item);
        }
        if (Object.values(item.invalid).some((val: boolean) => val === true)) {
          invalid = true;
        }
      });
      return !invalid;
    }

    saveActivity(activity: InterventionActivityExtended, pdOutputId: number, interventionId: number | null) {
      if (!this.validateActivity(activity) || !this.validateActivityItems(activity)) {
        this.requestUpdate();
        fireEvent(this, 'toast', {
          text: 'Please fix validation errors'
        });
        return;
      }
      fireEvent(this, 'global-loading', {
        active: true,
        loadingSource: this.localName
      });

      const activityToSave = cloneDeep(activity);
      if (activityToSave.items?.length) {
        // Let backend calculate these
        delete activityToSave.unicef_cash;
        delete activityToSave.cso_cash;
      }
      sendRequest({
        endpoint: this._getEndpoint(activity.id, String(pdOutputId), interventionId),
        method: activity.id ? 'PATCH' : 'POST',
        body: activityToSave
      })
        .then((response: any) => {
          getStore().dispatch(updateCurrentIntervention(response.intervention));
          this.refreshResultStructure = true;
        })
        .catch((error: any) => {
          fireEvent(this, 'toast', {text: formatServerErrorAsText(error)});
        })
        .finally(() => {
          fireEvent(this, 'global-loading', {
            active: false,
            loadingSource: this.localName
          });
        });
    }

    _getEndpoint(activityId: any, pdOutputId: string, interventionId: string) {
      return activityId
        ? getEndpoint(interventionEndpoints.pdActivityDetails, {activityId, pdOutputId, interventionId})
        : getEndpoint(interventionEndpoints.pdActivities, {pdOutputId, interventionId});
    }
  };
}
