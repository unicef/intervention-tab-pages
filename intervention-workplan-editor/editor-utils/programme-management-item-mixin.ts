import {Intervention} from '@unicef-polymer/etools-types';
import {Constructor} from '@unicef-polymer/etools-types/dist/global.types';
import '@polymer/paper-input/paper-input';
import {html, LitElement} from 'lit-element';
import {repeat} from 'lit-html/directives/repeat';
import {ifDefined} from 'lit-html/directives/if-defined.js';
import '@polymer/paper-input/paper-textarea';
import {translate, get as getTranslation} from 'lit-translate';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {ProgrammeManagementRowExtended, ProgrammeManagementRowItemExtended} from '../../common/types/editor-page-types';
import {ActivitiesCommonMixin} from '../../common/mixins/activities-common.mixin';
import {getItemTotalFormatted} from '../../common/components/activity/get-total.helper';
import {ActivitiesFocusMixin} from './activities-focus-mixin';

export function ProgrammeManagementItemMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ProgrammeManagementItemClass extends ActivitiesCommonMixin(ActivitiesFocusMixin(baseClass)) {
    // @ts-ignore
    @property({type: Object})
    intervention!: Intervention;

    // @ts-ignore
    @property({type: Object})
    permissions!: {
      edit: {management_budgets?: boolean};
      required: {management_budgets?: boolean};
    };

    // @ts-ignore
    @property({type: Boolean})
    oneEntityInEditMode!: boolean;

    handleEsc!: (event: KeyboardEvent) => void;
    // lastFocusedTd!: any;
    commentMode: any;

    renderProgrammeManagementItems(
      programmeManagement: ProgrammeManagementRowExtended,
      programmeManagementIndex: number
    ) {
      if (!programmeManagement || !programmeManagement.items || !programmeManagement.items.length) {
        return '';
      }
      return html`<tbody
        class="gray-1"
        ?inEditMode="${programmeManagement.inEditMode || programmeManagement.itemsInEditMode}"
      >
        ${repeat(
          programmeManagement.items || [],
          (item: ProgrammeManagementRowItemExtended) => item.id,
          (item: ProgrammeManagementRowItemExtended, itemIndex: number) => html`
            <tr
              class="activity-items-row ${programmeManagement.itemsInEditMode ? '' : 'readonly-mode'}"
              type="a-item"
              ?hoverable="${(!programmeManagement.itemsInEditMode &&
                this.permissions.edit.management_budgets &&
                !this.commentMode &&
                !this.oneEntityInEditMode) ||
              !item.id}"
              comment-element="programme-management-item-${item.id}"
              comment-description="${item.name}"
            >
              <td class="index-column">
                <paper-input
                  title="${programmeManagement.code}.${itemIndex + 1}"
                  .noLabelFloat="${!programmeManagement.itemsInEditMode}"
                  readonly
                  tabindex="-1"
                  .value="${programmeManagement.code}.${itemIndex + 1}"
                ></paper-input>
              </td>
              <td tabindex="${ifDefined(this.commentMode ? undefined : '0')}" class="a-item-padd">
                <div class="char-counter" ?hidden="${!programmeManagement.itemsInEditMode}">
                  <paper-textarea
                    .alwaysFloatLabel="${programmeManagement.itemsInEditMode}"
                    .noLabelFloat="${!programmeManagement.itemsInEditMode}"
                    input
                    label=${this.getLabel(programmeManagement.itemsInEditMode, getTranslation('ITEM_DESCRIPTION'))}
                    ?hidden="${!programmeManagement.itemsInEditMode}"
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
                      if (
                        programmeManagement.inEditMode &&
                        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
                      ) {
                        e.stopImmediatePropagation();
                      }
                      this.handleEsc(e);
                    }}"
                    @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'name', item)}"
                  ></paper-textarea>
                </div>
                <div
                  class="truncate-multi-line"
                  style="margin-bottom: 10px; margin-top: 8px;"
                  title="${item.name}"
                  ?hidden="${programmeManagement.itemsInEditMode}"
                >
                  ${item.name}
                </div>
              </td>
              <td tabindex="${ifDefined(this.commentMode ? undefined : '0')}">
                <paper-input
                  input
                  maxlength="150"
                  .alwaysFloatLabel="${programmeManagement.itemsInEditMode}"
                  .noLabelFloat="${!programmeManagement.itemsInEditMode}"
                  label=${this.getLabel(programmeManagement.itemsInEditMode, getTranslation('UNIT'))}
                  ?hidden="${!programmeManagement.itemsInEditMode}"
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
                    if (programmeManagement.itemsInEditMode && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                      e.stopImmediatePropagation();
                    }
                    this.handleEsc(e);
                  }}"
                  @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'unit', item)}"
                ></paper-input>
                <div class="truncate-single-line" title="${item.unit}" ?hidden="${programmeManagement.itemsInEditMode}">
                  ${item.unit}
                </div>
              </td>
              <td tabindex="${ifDefined(this.commentMode ? undefined : '0')}">
                <etools-currency-amount-input
                  label=${this.getLabel(programmeManagement.itemsInEditMode, getTranslation('N_OF_UNITS'))}
                  .noLabelFloat="${!programmeManagement.itemsInEditMode}"
                  input
                  ?readonly="${!programmeManagement.itemsInEditMode}"
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
                    this.updateActivityCashFromItem(programmeManagement, item);
                  }}"
                ></etools-currency-amount-input>
              </td>
              <td tabindex="${ifDefined(this.commentMode ? undefined : '0')}">
                <etools-currency-amount-input
                  label=${this.getLabel(programmeManagement.itemsInEditMode, getTranslation('PRICE_UNIT'))}
                  .noLabelFloat="${!programmeManagement.itemsInEditMode}"
                  input
                  ?readonly="${!programmeManagement.itemsInEditMode}"
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
                    this.updateActivityCashFromItem(programmeManagement, item);
                  }}"
                ></etools-currency-amount-input>
              </td>
              <td tabindex="${ifDefined(this.commentMode ? undefined : '0')}">
                <etools-currency-amount-input
                  label=${this.getLabel(programmeManagement.itemsInEditMode, getTranslation('PARTNER_CASH'))}
                  .noLabelFloat="${!programmeManagement.itemsInEditMode}"
                  input
                  ?readonly="${!programmeManagement.itemsInEditMode}"
                  required
                  error-message="${translate('INCORRECT_VALUE')}"
                  .invalid="${item.invalid?.cso_cash}"
                  @invalid-changed="${({detail}: CustomEvent) => {
                    this.activityItemInvalidChanged(detail, 'cso_cash', item);
                  }}"
                  .value="${item.cso_cash}"
                  @keydown="${(e: any) => this.handleEsc(e)}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.cashFieldChanged(detail, 'cso_cash', item, !this.hasUnfundedCash);
                    this.updateActivityCashFromItem(programmeManagement, item);
                  }}"
                ></etools-currency-amount-input>
              </td>
              <td tabindex="${ifDefined(this.commentMode ? undefined : '0')}">
                <etools-currency-amount-input
                  label=${this.getLabel(programmeManagement.itemsInEditMode, getTranslation('UNICEF_CASH'))}
                  .noLabelFloat="${!programmeManagement.itemsInEditMode}"
                  input
                  ?readonly="${!programmeManagement.itemsInEditMode}"
                  required
                  error-message="${translate('INCORRECT_VALUE')}"
                  .invalid="${item.invalid?.unicef_cash}"
                  @invalid-changed="${({detail}: CustomEvent) => {
                    this.activityItemInvalidChanged(detail, 'unicef_cash', item);
                  }}"
                  .value="${item.unicef_cash}"
                  @keydown="${(e: any) => this.handleEsc(e)}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.cashFieldChanged(detail, 'unicef_cash', item, !this.hasUnfundedCash);
                    this.updateActivityCashFromItem(programmeManagement, item);
                  }}"
                ></etools-currency-amount-input>
              </td>
              ${this.hasUnfundedCash
                ? html` <td tabindex="${ifDefined(this.commentMode ? undefined : '0')}">
                    <etools-currency-amount-input
                      label=${this.getLabel(programmeManagement.itemsInEditMode, getTranslation('UNFUNDED_CASH'))}
                      .noLabelFloat="${!programmeManagement.itemsInEditMode}"
                      input
                      ?readonly="${!programmeManagement.itemsInEditMode}"
                      required
                      error-message="${translate('INCORRECT_VALUE')}"
                      .invalid="${item.invalid?.unfunded_cash}"
                      @invalid-changed="${({detail}: CustomEvent) => {
                        this.activityItemInvalidChanged(detail, 'unfunded_cash', item);
                      }}"
                      .value="${item.unfunded_cash}"
                      @keydown="${(e: any) => this.handleEsc(e)}"
                      @value-changed="${({detail}: CustomEvent) => {
                        this.cashFieldChanged(detail, 'unfunded_cash', item, !this.hasUnfundedCash);
                        this.updateActivityCashFromItem(programmeManagement, item);
                      }}"
                    ></etools-currency-amount-input>
                  </td>`
                : ``}

              <td class="total action-btns" style="position:relative;" colspan="2">
                <paper-input
                  readonly
                  class="bold"
                  tabindex="-1"
                  .noLabelFloat="${!programmeManagement.itemsInEditMode}"
                  .value="${getItemTotalFormatted(item)}"
                ></paper-input>
                <div
                  class="hover-block flex-h ${programmeManagement.itemsInEditMode && !item.id
                    ? 'in-edit-and-deletable'
                    : ''}"
                >
                  <paper-icon-button
                    icon="create"
                    ?hidden="${!this.permissions.edit.management_budgets || !item.id}"
                    @click="${(e: CustomEvent) => {
                      programmeManagement.inEditMode = true;
                      programmeManagement.itemsInEditMode = true;
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
                    ?hidden="${!this.permissions.edit.management_budgets}"
                    @click="${() => this.removeProgrammeManagementItem(programmeManagement, itemIndex)}"
                  ></paper-icon-button>
                </div>
              </td>
            </tr>
          `
        )}
        ${!this.permissions.edit.management_budgets ||
        this.commentMode ||
        (!programmeManagement.itemsInEditMode && this.oneEntityInEditMode)
          ? html``
          : html`<tr type="add-item">
              <td></td>
              <td tabindex="${ifDefined(this.commentMode ? undefined : '0')}" class="a-item-add-padd">
                <div class="icon" @click="${(e: CustomEvent) => this.addNewItem(e, programmeManagement, 'focusAbove')}">
                  <paper-icon-button icon="add-box"></paper-icon-button> ${translate('ADD_NEW_ITEM')}
                </div>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              ${this.hasUnfundedCash ? html`<td></td>` : ``}
              <td colspan="2">
                <div
                  class="flex-h justify-right"
                  ?hidden="${!(
                    (programmeManagement.inEditMode || programmeManagement.itemsInEditMode) &&
                    programmeManagement.items?.length > 3
                  )}"
                >
                  <paper-button
                    id="btnSave-programme-management-2"
                    ?hidden="${!(
                      (programmeManagement.inEditMode || programmeManagement.itemsInEditMode) &&
                      programmeManagement.items?.length > 3
                    )}"
                    @click="${() => this.saveProgrammeManagement(programmeManagement, this.intervention.id!)}"
                    >${translate('GENERAL.SAVE')}</paper-button
                  >
                  <paper-icon-button
                    class="flex-none"
                    icon="close"
                    @click="${() =>
                      this.cancelProgrammeManagement(
                        programmeManagement.items,
                        programmeManagement,
                        programmeManagementIndex
                      )}"
                  ></paper-icon-button>
                </div>
              </td>
            </tr>`}
      </tbody>`;
    }

    saveProgrammeManagement!: (programmeManagement: ProgrammeManagementRowExtended, interventionId: number) => void;
    cancelProgrammeManagement!: (
      items: Partial<ProgrammeManagementRowItemExtended>[],
      programmeManagement: ProgrammeManagementRowExtended,
      programmeManagementIndex: number
    ) => void;

    async removeProgrammeManagementItem(programmeManagement: ProgrammeManagementRowExtended, itemIndex: number) {
      const confirmed = await openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          content: getTranslation('ARE_YOU_SURE_DEL'),
          confirmBtnText: translate('GENERAL.DELETE') as unknown as string,
          cancelBtnText: translate('GENERAL.CANCEL') as unknown as string
        }
      }).then(({confirmed}) => confirmed);
      if (confirmed) {
        const hasId = !!programmeManagement.items[itemIndex].id;
        programmeManagement.items.splice(itemIndex, 1);
        this.requestUpdate();
        // @ts-ignore
        if (hasId) {
          this.saveProgrammeManagement(programmeManagement, this.intervention.id!);
        }
      }
    }

    getLabel(itemsInEditMode: boolean, label: string) {
      return itemsInEditMode ? label : '';
    }

    setAutoValidate(item: ProgrammeManagementRowItemExtended, prop: string) {
      if (!item.autovalidate) {
        item.autovalidate = {};
      }
      item.autovalidate[prop] = true;
      this.requestUpdate();
    }

    addNewItem(e: CustomEvent, programmeManagement: ProgrammeManagementRowExtended, focusClue: string) {
      if (!programmeManagement.items) {
        programmeManagement.items = [];
      }
      // @ts-ignore
      programmeManagement.items?.push({name: '', inEditMode: true, kind: programmeManagement.kind});
      programmeManagement.itemsInEditMode = true;
      this.oneEntityInEditMode = true;
      this.requestUpdate();
      this.moveFocusToAddedItemAndAttachListeners(e.target, focusClue);
    }
  };
}
