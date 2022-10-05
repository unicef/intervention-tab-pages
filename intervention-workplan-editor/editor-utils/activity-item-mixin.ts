import {Intervention} from '@unicef-polymer/etools-types';
import {Constructor} from '@unicef-polymer/etools-types/dist/global.types';
import '@polymer/paper-input/paper-input';
import {html, LitElement} from 'lit-element';
import {
  InterventionActivityExtended,
  InterventionActivityItemExtended,
  ResultLinkLowerResultExtended
} from '../../common/types/editor-page-types';
import {repeat} from 'lit-html/directives/repeat';
import '@polymer/paper-input/paper-textarea';
import {translate, get as getTranslation} from 'lit-translate';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {ifDefined} from 'lit-html/directives/if-defined.js';
import {ActivitiesCommonMixin} from '../../common/mixins/activities-common.mixin';
import {getItemTotalFormatted} from '../../common/components/activity/get-total.helper';
import {ActivitiesFocusMixin} from './activities-focus-mixin';

export function ActivityItemsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ActivityItemsClass extends ActivitiesCommonMixin(ActivitiesFocusMixin(baseClass)) {
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
    oneEntityInEditMode!: boolean;

    handleEsc!: (event: KeyboardEvent) => void;

    commentMode: any;

    renderActivityItems(
      activity: InterventionActivityExtended,
      pdOutput: ResultLinkLowerResultExtended,
      resultIndex: number,
      pdOutputIndex: number,
      activityIndex: number
    ) {
      if (!activity || !activity.items || !activity.items.length) {
        return '';
      }
      return html`<tbody class="gray-1">
        ${repeat(
          activity.items || [],
          (item: InterventionActivityItemExtended) => item.id,
          (item: InterventionActivityItemExtended, itemIndex: number) => html`
            <tr
              class="activity-items-row ${activity.itemsInEditMode ? '' : 'readonly-mode'}"
              type="a-item"
              ?hoverable="${(!activity.itemsInEditMode &&
                this.permissions.edit.result_links &&
                !this.commentMode &&
                !this.oneEntityInEditMode) ||
              !item.id}"
              comment-element="activity-item-${item.id}"
              comment-description=" Activity item - ${item.name}"
            >
              <td class="index-column">
                <paper-input
                  title="${item.code || ''}"
                  .noLabelFloat="${!activity.itemsInEditMode}"
                  readonly
                  tabindex="-1"
                  .value="${item.code || 'N/A'}"
                ></paper-input>
              </td>
              <td tabindex="0" class="a-item-padd">
                <div class="char-counter" ?hidden="${!activity.itemsInEditMode}">
                  <paper-textarea
                    .alwaysFloatLabel="${activity.itemsInEditMode}"
                    .noLabelFloat="${!activity.itemsInEditMode}"
                    input
                    label=${this.getLabel(activity.itemsInEditMode, getTranslation('ITEM_DESCRIPTION'))}
                    ?hidden="${!activity.itemsInEditMode}"
                    char-counter
                    maxlength="150"
                    .invalid="${item.invalid?.name}"
                    @invalid-changed="${({detail}: CustomEvent) => {
                      this.activityItemInvalidChanged(detail, 'name', item);
                    }}"
                    required
                    error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                    .autoValidate="${item.autovalidate?.name}"
                    @focus="${() => this.setAutoValidate(item, 'name')}"
                    .value="${item.name}"
                    @keydown="${(e: any) => {
                      if (activity.inEditMode && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                        e.stopImmediatePropagation();
                      }
                      this.handleEsc(e);
                    }}"
                    @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'name', item)}"
                  ></paper-textarea>
                </div>
                <div class="truncate-multi-line" title="${item.name}" ?hidden="${activity.itemsInEditMode}">
                  ${item.name}
                </div>
              </td>
              <td tabindex="0">
                <paper-input
                  input
                  maxlength="150"
                  .alwaysFloatLabel="${activity.itemsInEditMode}"
                  .noLabelFloat="${!activity.itemsInEditMode}"
                  label=${this.getLabel(activity.itemsInEditMode, 'Unit')}
                  ?hidden="${!activity.itemsInEditMode}"
                  .invalid="${item.invalid?.unit}"
                  @invalid-changed="${({detail}: CustomEvent) => {
                    this.activityItemInvalidChanged(detail, 'unit', item);
                  }}"
                  required
                  .autoValidate="${item.autovalidate?.unit}"
                  @focus="${() => this.setAutoValidate(item, 'unit')}"
                  error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                  .value="${item.unit}"
                  @keydown="${(e: any) => {
                    if (activity.itemsInEditMode && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                      e.stopImmediatePropagation();
                    }
                    this.handleEsc(e);
                  }}"
                  @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'unit', item)}"
                ></paper-input>
                <div class="truncate-single-line" title="${item.unit}" ?hidden="${activity.itemsInEditMode}">
                  ${item.unit}
                </div>
              </td>
              <td tabindex="0">
                <etools-currency-amount-input
                  label=${this.getLabel(activity.itemsInEditMode, 'N. of Units')}
                  .noLabelFloat="${!activity.itemsInEditMode}"
                  input
                  tabindex="${ifDefined(item.inEditMode ? undefined : '-1')}"
                  ?readonly="${!activity.itemsInEditMode}"
                  .invalid="${item.invalid?.no_units}"
                  no-of-decimals="2"
                  @invalid-changed="${({detail}: CustomEvent) => {
                    this.activityItemInvalidChanged(detail, 'no_units', item);
                  }}"
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
                    this.updateActivityCashFromItem(activity, item);
                  }}"
                ></etools-currency-amount-input>
              </td>
              <td tabindex="0">
                <etools-currency-amount-input
                  label=${this.getLabel(activity.itemsInEditMode, 'Price/Unit')}
                  .noLabelFloat="${!activity.itemsInEditMode}"
                  input
                  tabindex="${ifDefined(item.inEditMode ? undefined : '-1')}"
                  ?readonly="${!activity.itemsInEditMode}"
                  .invalid="${item.invalid?.unit_price}"
                  @invalid-changed="${({detail}: CustomEvent) => {
                    this.activityItemInvalidChanged(detail, 'unit_price', item);
                  }}"
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
                    this.updateActivityCashFromItem(activity, item);
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
                  tabindex="${ifDefined(item.inEditMode ? undefined : '-1')}"
                  auto-validate
                  error-message="${translate('INCORRECT_VALUE')}"
                  .invalid="${item.invalid?.cso_cash}"
                  @invalid-changed="${({detail}: CustomEvent) => {
                    this.activityItemInvalidChanged(detail, 'cso_cash', item);
                  }}"
                  .value="${item.cso_cash}"
                  @keydown="${(e: any) => this.handleEsc(e)}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.cashFieldChanged(detail, 'cso_cash', item);
                    this.updateActivityCashFromItem(activity, item);
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
                  tabindex="${ifDefined(item.inEditMode ? undefined : '-1')}"
                  auto-validate
                  error-message="${translate('INCORRECT_VALUE')}"
                  .invalid="${item.invalid?.unicef_cash}"
                  @invalid-changed="${({detail}: CustomEvent) => {
                    this.activityItemInvalidChanged(detail, 'unicef_cash', item);
                  }}"
                  .value="${item.unicef_cash}"
                  @keydown="${(e: any) => this.handleEsc(e)}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.cashFieldChanged(detail, 'unicef_cash', item);
                    this.updateActivityCashFromItem(activity, item);
                  }}"
                ></etools-currency-amount-input>
              </td>
              <td class="total action-btns" style="position:relative;" colspan="2">
                <paper-input
                  readonly
                  class="bold"
                  tabindex="-1"
                  .noLabelFloat="${!activity.itemsInEditMode}"
                  .value="${getItemTotalFormatted(item)}"
                ></paper-input>
                <div class="hover-block flex-h">
                  <paper-icon-button
                    icon="create"
                    ?hidden="${!this.permissions.edit.result_links || !item.id}"
                    @click="${(e: CustomEvent) => {
                      activity.inEditMode = true;
                      activity.itemsInEditMode = true;
                      this.oneEntityInEditMode = true;
                      this.requestUpdate();

                      if (e.isTrusted) {
                        // Avoids focus moving to first input when clicking enter on other
                        this.preserveFocusOnRow(e.target);
                      }
                    }}"
                  ></paper-icon-button>
                  <paper-icon-button
                    id="delItem"
                    icon="delete"
                    tabindex="0"
                    ?hidden="${!this.permissions.edit.result_links}"
                    @click="${() => this.removeActivityItem(activity, pdOutput, itemIndex)}"
                  ></paper-icon-button>
                </div>
              </td>
            </tr>
          `
        )}
        <tr
          ?hidden="${!this.permissions.edit.result_links ||
          this.commentMode ||
          (!activity.itemsInEditMode && this.oneEntityInEditMode)}"
          type="add-item"
        >
          <td></td>
          <td tabindex="0" class="a-item-add-padd">
            <div class="icon" @click="${(e: CustomEvent) => this.addNewActivityItem(e, activity, 'focusAbove')}">
              <paper-icon-button icon="add-box"></paper-icon-button> ${translate('ADD_NEW_ITEM')}
            </div>
          </td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td colspan="2">
            <div
              class="flex-h justify-right"
              ?hidden="${!((activity.inEditMode || activity.itemsInEditMode) && activity.items?.length > 3)}"
            >
              <paper-button
                id="btnSave-activity-2"
                ?hidden="${!((activity.inEditMode || activity.itemsInEditMode) && activity.items?.length > 3)}"
                @click="${() => this.saveActivity(activity, pdOutput.id, this.intervention.id!)}"
                >${translate('GENERAL.SAVE')}</paper-button
              >
              <paper-icon-button
                class="flex-none"
                icon="close"
                @click="${() =>
                  this.cancelActivity(pdOutput.activities, activity, resultIndex, pdOutputIndex, activityIndex)}"
              ></paper-icon-button>
            </div>
          </td>
        </tr>
      </tbody>`;
    }

    saveActivity!: (activity: InterventionActivityExtended, pdOutputId: number, interventionId: number) => void;
    cancelActivity!: (
      activities: Partial<InterventionActivityExtended>[],
      activity: InterventionActivityExtended,
      resultIndex: number,
      pdOutputIndex: number,
      activityIndex: number
    ) => void;

    async removeActivityItem(
      activity: InterventionActivityExtended,
      pdOutput: ResultLinkLowerResultExtended,
      itemIndex: number
    ) {
      const confirmed = await openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          content: 'Are you sure you want to delete this activity item?'
        }
      }).then(({confirmed}) => confirmed);
      if (confirmed) {
        const hasId = !!activity.items[itemIndex].id;
        activity.items.splice(itemIndex, 1);
        this.requestUpdate();
        // @ts-ignore
        if (hasId) {
          this.saveActivity(activity, pdOutput.id, this.intervention.id!);
        }
      }
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

    addNewActivityItem(e: CustomEvent, activity: Partial<InterventionActivityExtended>, focusClue: string) {
      if (!activity.items) {
        activity.items = [];
      }
      activity.items?.push({name: '', inEditMode: true} as any);
      activity.inEditMode = true;
      activity.itemsInEditMode = true;
      this.oneEntityInEditMode = true;
      this.requestUpdate();
      this.moveFocusToAddedItemAndAttachListeners(e.target, focusClue);
    }
  };
}
