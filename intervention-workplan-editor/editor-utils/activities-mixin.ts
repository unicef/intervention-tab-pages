// @ts-ignore
import {Constructor, html, LitElement, property} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined.js';
import {EtoolsEndpoint, InterventionQuarter} from '@unicef-polymer/etools-types';
import {Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import '../time-intervals/time-intervals';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {ActivityItemsMixin} from './activity-item-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {updateCurrentIntervention} from '../../common/actions/interventions';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {repeat} from 'lit-html/directives/repeat';
import {
  ExpectedResultExtended,
  InterventionActivityExtended,
  ResultLinkLowerResultExtended
} from '../../common/types/editor-page-types';
import {translate, get as getTranslation} from 'lit-translate';
import {TruncateMixin} from '../../common/mixins/truncate.mixin';
import {getTotalCashFormatted} from '../../common/components/activity/get-total.helper';
import {
  openActivityDeactivationDialog,
  openDeleteActivityDialog,
  _canDeactivate,
  _canDelete
} from '../../common/mixins/results-structure-common';

export function ActivitiesMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ActivitiesClass extends ActivityItemsMixin(TruncateMixin(baseClass)) {
    // @ts-ignore
    @property({type: Array})
    originalResultStructureDetails!: ExpectedResultExtended[];

    // @ts-ignore
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

    // @ts-ignore
    @property({type: Boolean})
    autoValidateActivityName = false;
    // @ts-ignore
    @property({type: Boolean})
    oneEntityInEditMode!: boolean;

    handleEsc!: (event: KeyboardEvent) => void;
    refreshResultStructure = false;
    quarters: InterventionQuarter[] = [];
    commentMode: any;

    renderActivities(pdOutput: ResultLinkLowerResultExtended, resultIndex: number, pdOutputIndex: number) {
      if (!pdOutput || !pdOutput.activities) {
        return '';
      }
      this.attachTimeIntervalsListener();

      return html`
        ${repeat(
          pdOutput.activities || [],
          (activity: InterventionActivityExtended) => activity.id,
          (activity: InterventionActivityExtended, activityIndex: number) => html`
            <tbody
              ?hoverable="${!(activity.inEditMode || activity.itemsInEditMode || !activity.is_active) &&
              this.permissions.edit.result_links &&
              !this.commentMode &&
              !this.oneEntityInEditMode}"
              ?inEditMode="${activity.inEditMode || activity.itemsInEditMode}"
              comment-element="activity-${activity.id}"
              comment-description="${activity.name}"
            >
              <tr class="header">
                <td></td>
                <td colspan="3">${translate('ACTIVITY')}</td>
                <td class="a-center">${translate('TIME_PERIODS')}</td>
                <td><label required>${translate('PARTNER_CASH')}</label></td>
                <td><label required>${translate('UNICEF_CASH')}</label></td>
                ${this.hasUnfundedCash ? html`<td><label required>${translate('UNFUNDED_CASH')}</label></td>` : ``}
                <td colspan="2">${translate('GENERAL.TOTAL')}</td>
              </tr>
              <tr class="text action-btns" type="activity">
                <td class="index-column">
                  <paper-input
                    title="${activity.code}"
                    no-label-float
                    readonly
                    tabindex="-1"
                    .value="${activity.code}"
                  ></paper-input>
                </td>
                <td
                  colspan="3"
                  tabindex="${ifDefined(this.commentMode ? undefined : 0)}"
                  class="no-top-padding height-for-action-btns"
                >
                  <paper-textarea
                    no-label-float
                    input
                    class="name bold"
                    .value="${activity.name}"
                    ?hidden="${!activity.inEditMode}"
                    char-counter
                    maxlength="150"
                    required
                    .autoValidate="${this.autoValidateActivityName}"
                    .invalid="${activity.invalid?.name}"
                    error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                    @keydown="${(e: any) => {
                      if (activity.inEditMode && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                        e.stopImmediatePropagation();
                      }
                      this.handleEsc(e);
                    }}"
                    @focus="${() => setTimeout(() => (this.autoValidateActivityName = true))}"
                    @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'name', activity)}"
                  ></paper-textarea>
                  <div class="truncate-multi-line b" title="${activity.name}" ?hidden="${activity.inEditMode}">
                    ${activity.is_active ? '' : html`<b>(${translate('INACTIVE')})</b>`}${activity.name}
                  </div>
                  <div class="pad-top-8">
                    <paper-textarea
                      class="other"
                      placeholder="-"
                      input
                      label="${translate('OTHER_NOTES')}"
                      always-float-label
                      ?hidden="${!activity.inEditMode}"
                      char-counter
                      maxlength="10000"
                      .value="${activity.context_details}"
                      @keydown="${(e: any) => {
                        if (
                          activity.inEditMode &&
                          ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
                        ) {
                          e.stopImmediatePropagation();
                        }
                        this.handleEsc(e);
                      }}"
                      @value-changed="${({detail}: CustomEvent) =>
                        this.valueChanged(detail, 'context_details', activity)}"
                    ></paper-textarea>
                    <div title="${activity.context_details}" ?hidden="${activity.inEditMode}">
                      ${this.truncateString(activity.context_details)}
                    </div>
                  </div>
                </td>
                <td tabindex="${ifDefined(this.commentMode ? undefined : 0)}" class="tdTimeIntervals">
                  <div class="flex-h justify-center">
                    <time-intervals
                      .readonly="${!this.permissions.edit.result_links || !activity.inEditMode}"
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
                <td
                  tabindex="${(activity.items && activity.items.length) || this.commentMode ? '-1' : '0'}"
                  class="no-top-padding"
                >
                  <etools-currency-amount-input
                    no-label-float
                    input
                    .value="${activity.cso_cash}"
                    tabindex="${ifDefined(
                      (activity.items && activity.items.length) || !activity.inEditMode ? '-1' : undefined
                    )}"
                    ?readonly="${this.isReadonlyCash(activity.inEditMode, activity.items)}"
                    @keydown="${(e: any) => this.handleEsc(e)}"
                    @value-changed="${({detail}: CustomEvent) => this.numberChanged(detail, 'cso_cash', activity)}"
                    required
                    .invalid="${activity.invalid?.cso_cash}"
                    error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                  ></etools-currency-amount-input>
                </td>
                <td
                  tabindex="${(activity.items && activity.items.length) || this.commentMode ? '-1' : '0'}"
                  class="no-top-padding"
                >
                  <etools-currency-amount-input
                    no-label-float
                    input
                    .value="${activity.unicef_cash}"
                    tabindex="${ifDefined(
                      (activity.items && activity.items.length) || !activity.inEditMode ? '-1' : undefined
                    )}"
                    ?readonly="${this.isReadonlyCash(activity.inEditMode, activity.items)}"
                    @keydown="${(e: any) => this.handleEsc(e)}"
                    @value-changed="${({detail}: CustomEvent) => this.numberChanged(detail, 'unicef_cash', activity)}"
                    required
                    .invalid="${activity.invalid?.unicef_cash}"
                    error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                  ></etools-currency-amount-input>
                </td>
                ${this.hasUnfundedCash
                  ? html` <td
                      tabindex="${(activity.items && activity.items.length) || this.commentMode ? '-1' : '0'}"
                      class="no-top-padding"
                    >
                      <etools-currency-amount-input
                        no-label-float
                        input
                        .value="${activity.unfunded_cash}"
                        tabindex="${ifDefined(
                          (activity.items && activity.items.length) || !activity.inEditMode ? '-1' : undefined
                        )}"
                        ?readonly="${this.isReadonlyCash(activity.inEditMode, activity.items)}"
                        @keydown="${(e: any) => this.handleEsc(e)}"
                        @value-changed="${({detail}: CustomEvent) =>
                          this.numberChanged(detail, 'unfunded_cash', activity)}"
                        required
                        .invalid="${activity.invalid?.unfunded_cash}"
                        error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                      ></etools-currency-amount-input>
                    </td>`
                  : ``}
                <td
                  colspan="2"
                  class="padd-top-10 action-btns"
                  style="position: relative;"
                  tabindex="${ifDefined(this.permissions.edit.result_links && !this.commentMode ? '0' : undefined)}"
                >
                  <div>
                    ${this.intervention.planned_budget.currency}
                    <span class="b">
                      ${getTotalCashFormatted(activity.cso_cash, activity.unicef_cash, activity.unfunded_cash)}
                    </span>
                  </div>
                  <div class="action-btns align-bottom flex-h">
                    <paper-icon-button
                      icon="create"
                      ?hidden="${activity.inEditMode || !this.permissions.edit.result_links || !activity.is_active}"
                      @click="${(e: any) => {
                        activity.inEditMode = true;
                        activity.itemsInEditMode = true;
                        this.oneEntityInEditMode = true;
                        this.requestUpdate();
                        // @ts-ignore
                        if (e.isTrusted || this.enterClickedOnActionBtnsTd()) {
                          // If the btn is clicked from code (!e.isTrusted) ,
                          // might be that the focus has to be preserved on the activty item
                          // @ts-ignore
                          this.moveFocusToFirstInput(e.target);
                        }
                      }}"
                    ></paper-icon-button>
                    <paper-icon-button
                      id="add-item-${activity.id}"
                      icon="add-box"
                      slot="custom-icon"
                      @click="${(e: CustomEvent) => this.addNewActivityItem(e, activity, 'focusBelow')}"
                      ?hidden="${activity.items?.length || !this.permissions.edit.result_links}"
                    ></paper-icon-button>
                    <paper-tooltip
                      for="add-item-${activity.id}"
                      .animationDelay="${0}"
                      .animationConfig="${{}}"
                      animation-entry=""
                      animation-exit=""
                      ?hidden="${activity.items?.length || !this.permissions.edit.result_links}"
                      position="top"
                      offset="1"
                    >
                      ${translate('ADD_NEW_ITEM')}
                    </paper-tooltip>
                    <paper-icon-button
                      icon="delete"
                      ?hidden="${activity.inEditMode ||
                      !_canDelete(
                        activity,
                        !this.permissions.edit.result_links!,
                        this.intervention.status,
                        this.intervention.in_amendment,
                        this.intervention.in_amendment_date
                      )}"
                      @click="${() => openDeleteActivityDialog(activity.id, pdOutput.id, this.intervention.id!)}"
                    ></paper-icon-button>
                    <paper-icon-button
                      icon="block"
                      ?hidden="${activity.inEditMode ||
                      !_canDeactivate(
                        activity,
                        !this.permissions.edit.result_links!,
                        this.intervention.status,
                        this.intervention.in_amendment,
                        this.intervention.in_amendment_date
                      )}"
                      @click="${() => openActivityDeactivationDialog(activity.id, pdOutput.id, this.intervention.id!)}"
                    ></paper-icon-button>
                  </div>
                  <div
                    class="flex-h justify-right align-bottom"
                    ?hidden="${!(activity.inEditMode || activity.itemsInEditMode)}"
                  >
                    <paper-button
                      id="btnSave-Activity"
                      ?hidden="${!(activity.inEditMode || activity.itemsInEditMode)}"
                      @click="${() => this.saveActivity(activity, pdOutput.id, this.intervention.id!)}"
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
              <tr class="header no-padd gray-1" ?inEditMode="${activity.inEditMode || activity.itemsInEditMode}">
                <td class="first-col"></td>
                <td class="col-text">${translate('ITEM_DESCRIPTION')}</td>
                <td class="col-unit">${translate('UNIT')}</td>
                <td class="col-unit-no">${translate('NUMBER_UNITS')}</td>
                <td class="col-p-per-unit">${translate('PRICE_UNIT')}</td>
                <td class="col-g">${translate('PARTNER_CASH')}</td>
                <td class="col-g">${translate('UNICEF_CASH')}</td>
                ${this.hasUnfundedCash ? html`<td class="col-g">${translate('UNFUNDED_CASH')}</td>` : ``}
                <td class="col-g" colspan="2">${translate('TOTAL')} (${this.intervention.planned_budget.currency})</td>
              </tr>
            </tbody>
            ${this.renderActivityItems(activity, pdOutput, resultIndex, pdOutputIndex, activityIndex)}
          `
        )}
      `;
    }

    attachTimeIntervalsListener() {
      setTimeout(() => {
        this.shadowRoot!.querySelectorAll('.tdTimeIntervals').forEach((el) =>
          el.addEventListener('keydown', this._onTimeIntervalsKeyDown)
        );
      }, 400);
    }

    _onTimeIntervalsKeyDown(event: any) {
      if (event.key === 'Enter') {
        const editBtnEl = event.currentTarget.parentElement.querySelector('paper-icon-button[icon="create"]');
        const timeIntervalEl = event.currentTarget.querySelector('time-intervals');
        // if in edit mode and found time-interval component, open Time Periods dialog
        if (timeIntervalEl && editBtnEl && editBtnEl.hasAttribute('hidden')) {
          timeIntervalEl.openDialog();
        }
      }
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

      activity.inEditMode = false;
      activity.itemsInEditMode = false;

      if (!activity.id) {
        activities.shift();
      } else {
        Object.assign(activity, cloneDeep(this.getOriginalActivity(resultIndex, pdOutputIndex, activityIndex)));
        this.resetItemsValidations(activity);
      }
      this.oneEntityInEditMode = false;
      this.requestUpdate();
      // @ts-ignore
      this.lastFocusedTd.focus();
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

    validateActivity(activity: InterventionActivityExtended) {
      activity.invalid = {};

      activity.invalid.name = !activity.name;
      activity.invalid.unicef_cash = isNaN(parseFloat(String(activity.unicef_cash)));
      activity.invalid.cso_cash = isNaN(parseFloat(String(activity.cso_cash)));
      activity.invalid.unfunded_cash = isNaN(parseFloat(String(activity.unfunded_cash)));

      if (this.quarters && this.quarters.length) {
        if (!(activity.time_frames && activity.time_frames.length)) {
          activity.invalid.time_frames = true;
        }
      }
      return !Object.values(activity.invalid).some((val) => val === true);
    }

    // @ts-ignore
    saveActivity(activity: InterventionActivityExtended, pdOutputId: number, interventionId: number) {
      if (!this.validateActivity(activity) || !this.validateActivityItems(activity)) {
        this.requestUpdate();
        fireEvent(this, 'toast', {
          text: getTranslation('FIX_VALIDATION_ERRORS')
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
          this.oneEntityInEditMode = false;
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
        ? getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(interventionEndpoints.pdActivityDetails, {
            activityId,
            pdOutputId,
            interventionId
          })
        : getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(interventionEndpoints.pdActivities, {
            pdOutputId,
            interventionId
          });
    }
  };
}
