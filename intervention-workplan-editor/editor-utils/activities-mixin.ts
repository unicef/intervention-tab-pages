// @ts-ignore
import {Constructor, html, LitElement, property} from 'lit-element';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {AsyncAction, InterventionQuarter} from '@unicef-polymer/etools-types';
import {Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import '../time-intervals/time-intervals';
import {cloneDeep, isJsonStrMatch} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {ActivityItemsMixin} from './activity-item-mixin';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getIntervention, updateCurrentIntervention} from '../../common/actions/interventions';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {repeat} from 'lit-html/directives/repeat';
import {
  ExpectedResultExtended,
  InterventionActivityExtended,
  InterventionActivityItemExtended,
  ResultLinkLowerResultExtended
} from './types';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {translate} from 'lit-translate/directives/translate';

export function ActivitiesMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ActivitiesClass extends ActivityItemsMixin(baseClass) {
    // @ts-ignore
    @property({type: Array})
    originalResultStructureDetails!: ExpectedResultExtended[];

    @property({type: Array})
    resultStructureDetails!: ExpectedResultExtended[];

    // @ts-ignore
    @property({type: Object})
    intervention!: Intervention;

    // @ts-ignore
    @property({type: Object})
    permissions!: {
      edit: {result_links?: boolean};
      required: {result_links?: boolean};
    };

    handleEsc!: (event: KeyboardEvent) => void;
    refreshResultStructure = false;
    quarters: InterventionQuarter[] = [];

    renderActivities(pdOutput: ResultLinkLowerResultExtended, resultIndex: number, pdOutputIndex: number) {
      if (!pdOutput || !pdOutput.activities) {
        return '';
      }
      return html`
        ${repeat(
          pdOutput.activities || [],
          (activity: InterventionActivityExtended) => activity.id,
          (activity: InterventionActivityExtended, activityIndex: number) => html`
            <tbody
              hoverable
              comment-element="activity-${activity.id}"
              comment-description=" Activity - ${activity.name}"
              ?in-edit-mode="${activity.inEditMode || activity.itemsInEditMode}"
              ?has-edit-permissions="${this.permissions.edit.result_links}"
            >
              <tr class="header">
                <td></td>
                <td colspan="3">${translate('ACTIVITY')}</td>
                <td class="a-center">${translate('TIME_PERIODS')}</td>
                <td>${translate('PARTNER_CASH')}</td>
                <td>${translate('UNICEF_CASH')}</td>
                <td colspan="2">${translate('GENERAL.TOTAL')}</td>
              </tr>
              <tr class="text action-btns" type="activity">
                <td class="padd-top-10">${activity.code}</td>
                <td colspan="3" tabindex="0" class="no-top-padding">
                  <paper-textarea
                    no-label-float
                    input
                    class="name bold"
                    .value="${activity.name}"
                    ?readonly="${!activity.inEditMode}"
                    required
                    .invalid="${activity.invalid?.name}"
                    error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                    @keydown="${(e: any) => this.handleEsc(e)}"
                    @value-changed="${({detail}: CustomEvent) => this.updateModelValue(activity, 'name', detail.value)}"
                  ></paper-textarea>
                  <div class="pad-top-8">
                    <paper-textarea
                      class="other"
                      placeholder="-"
                      input
                      label="Other Notes"
                      always-float-label
                      ?readonly="${!activity.inEditMode}"
                      .value="${activity.context_details}"
                      @keydown="${(e: any) => this.handleEsc(e)}"
                      @value-changed="${({detail}: CustomEvent) =>
                        this.updateModelValue(activity, 'context_details', detail.value)}"
                    ></paper-textarea>
                  </div>
                </td>
                <td tabindex="0">
                  <div class="flex-h justify-center">
                    <time-intervals
                      .readonly="${!this.permissions.edit.result_links}"
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
                      @keydown="${(e: any) => this.handleEsc(e)}"
                    ></time-intervals>
                  </div>
                </td>
                <td tabindex="${activity.items && activity.items.length ? '-1' : '0'}">
                  <etools-currency-amount-input
                    no-label-float
                    input
                    .value="${activity.cso_cash}"
                    ?readonly="${this.isReadonlyForActivityCash(activity.inEditMode, activity.items)}"
                    @keydown="${(e: any) => this.handleEsc(e)}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.updateModelValue(activity, 'cso_cash', detail.value)}"
                  ></etools-currency-amount-input>
                </td>
                <td tabindex="${activity.items && activity.items.length ? '-1' : '0'}">
                  <etools-currency-amount-input
                    no-label-float
                    input
                    .value="${activity.unicef_cash}"
                    ?readonly="${this.isReadonlyForActivityCash(activity.inEditMode, activity.items)}"
                    @keydown="${(e: any) => this.handleEsc(e)}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.updateModelValue(activity, 'unicef_cash', detail.value)}"
                  ></etools-currency-amount-input>
                </td>
                <td
                  colspan="2"
                  class="padd-top-10 action-btns"
                  style="position: relative;"
                  tabindex="${this.permissions.edit.result_links ? '0' : '-1'}"
                >
                  <div>
                    ${this.intervention.planned_budget.currency}
                    <span class="b">
                      ${displayCurrencyAmount(
                        String(this.getTotalForActivity(activity.cso_cash, activity.unicef_cash)),
                        '0',
                        2
                      )}
                    </span>
                  </div>
                  <div class="action-btns align-bottom flex-h">
                    <paper-icon-button
                      icon="create"
                      ?hidden="${activity.inEditMode || !this.permissions.edit.result_links}"
                      @click="${(e: any) => {
                        activity.inEditMode = true;
                        activity.itemsInEditMode = true;
                        this.requestUpdate();
                        // @ts-ignore
                        this.moveFocusToFirstInput(e.target);
                      }}"
                    ></paper-icon-button>
                    <etools-info-tooltip
                      position="top"
                      custom-icon
                      ?hide-tooltip="${!this.permissions.edit.result_links}"
                      style="justify-content:end;"
                    >
                      <paper-icon-button
                        icon="add-box"
                        slot="custom-icon"
                        @click="${(e: CustomEvent) => this.addNewItem(e, activity, 'focusBelow')}"
                        ?hidden="${activity.items?.length || !this.permissions.edit.result_links}"
                      ></paper-icon-button>
                      <span class="no-wrap" slot="message">${translate('ADD_NEW_ITEM')}</span>
                    </etools-info-tooltip>
                    <paper-icon-button
                      icon="delete"
                      ?hidden="${activity.inEditMode || !this.permissions.edit.result_links}"
                      @click="${() => this.openDeleteDialog(activity.id, pdOutput.id)}"
                    ></paper-icon-button>
                  </div>
                  <div
                    class="flex-h justify-right align-bottom"
                    ?hidden="${!(activity.inEditMode || activity.itemsInEditMode)}"
                  >
                    <paper-button @click="${() => this.saveActivity(activity, pdOutput.id, this.intervention.id!)}"
                      >${translate('GENERAL.SAVE')}</paper-button
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

            <tbody thead ?hidden="${!activity.items || !activity.items.length}">
              <tr class="header no-padd">
                <td class="first-col"></td>
                <td class="col-44p">${translate('ITEM_DESCRIPTION')}</td>
                <td class="col-6p">${translate('UNIT')}</td>
                <td class="col-6p">${translate('NUMBER_UNITS')}</td>
                <td class="col-g">${translate('PRICE_UNIT')}</td>
                <td class="col-g">${translate('PARTNER_CASH')}</td>
                <td class="col-g">${translate('UNICEF_CASH')}</td>
                <td class="col-g" colspan="2">${translate('TOTAL')} (${this.intervention.planned_budget.currency})</td>
              </tr>
            </tbody>
            ${this.renderActivityItems(activity, pdOutput, resultIndex, pdOutputIndex, activityIndex)}
          `
        )}
      `;
    }

    getTotalForActivity(partner: string, unicef: string): number {
      return (Number(partner) || 0) + (Number(unicef) || 0);
    }

    // @ts-ignore
    cancelActivity(
      activities: Partial<InterventionActivityExtended>[],
      activity: InterventionActivityExtended,
      resultIndex: number,
      pdOutputIndex: number,
      activityIndex: number
    ) {
      activity.invalid = {name: false, context_details: false, time_frames: false};
      if (activity.items) {
        activity.items.forEach((i: any) => {
          if (i.invalid) {
            Object.keys(i.invalid).forEach((key) => (i.invalid[key] = false));
          }
        });
      }

      activity.inEditMode = false;
      activity.itemsInEditMode = false;

      if (!activity.id) {
        activities.shift();
      } else {
        Object.assign(activity, cloneDeep(this.getOriginalActivity(resultIndex, pdOutputIndex, activityIndex)));
      }
      this.requestUpdate();
    }

    getOriginalActivity(resultIndex: number, pdOutputIndex: number, activityIndex: number) {
      // Covers case when a new Activity is added while the cancelled one is already in edit mode,
      // thus changing the index
      let originalActivityIndex = activityIndex;
      if (this.resultStructureDetails[resultIndex].ll_results[pdOutputIndex].activities.find((a) => !a.id)) {
        originalActivityIndex = originalActivityIndex - 1;
      }
      return this.originalResultStructureDetails[resultIndex].ll_results[pdOutputIndex].activities[
        originalActivityIndex
      ];
    }
    updateModelValue(model: any, property: string, newVal: any) {
      if (newVal == model[property]) {
        return;
      }
      model[property] = newVal;
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
        item.invalid.unit = !item.unit;
        item.invalid.no_units = !item.no_units || Number(item.no_units) == 0;
        item.invalid.unit_price = !item.unit_price || Number(item.unit_price) == 0;
        if (item.no_units && item.unit_price) {
          this.validateCsoAndUnicefCash(item);
        }
        if (Object.values(item.invalid).some((val: boolean) => val === true)) {
          invalid = true;
        }
      });
      return !invalid;
    }

    // @ts-ignore
    saveActivity(activity: InterventionActivityExtended, pdOutputId: number, interventionId: number) {
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
        endpoint: this._getEndpoint(activity.id, String(pdOutputId), String(interventionId)),
        method: activity.id ? 'PATCH' : 'POST',
        body: activityToSave
      })
        .then((response: any) => {
          this.refreshResultStructure = true;
          getStore().dispatch(updateCurrentIntervention(response.intervention));
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

    async openDeleteDialog(activityId: number, pdOutputId: number) {
      const confirmed = await openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          content: translate('DELETE_ACTIVITY_PROMPT') as unknown as string,
          confirmBtnText: translate('GENERAL.DELETE') as unknown as string
        }
      }).then(({confirmed}) => {
        return confirmed;
      });

      if (confirmed) {
        this.deleteActivity(activityId, pdOutputId);
      }
    }

    deleteActivity(activityId: number, pdOutputId: number) {
      const endpoint = getEndpoint(interventionEndpoints.pdActivityDetails, {
        activityId: activityId,
        interventionId: this.intervention.id,
        pdOutputId: pdOutputId
      });
      sendRequest({
        method: 'DELETE',
        endpoint: endpoint
      })
        .then(() => {
          // @ts-ignore
          this.getResultLinksDetails();
          getStore().dispatch<AsyncAction>(getIntervention());
        })
        .catch((err: any) => {
          fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
        });
    }
  };
}
