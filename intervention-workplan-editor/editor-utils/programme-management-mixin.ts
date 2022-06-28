// @ts-ignore
import {Constructor, html, LitElement, property} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined.js';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import '../time-intervals/time-intervals';
import {cloneDeep} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {updateCurrentIntervention} from '../../common/actions/interventions';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {repeat} from 'lit-html/directives/repeat';
import {translate, get as getTranslation} from 'lit-translate';
import {TruncateMixin} from '../../common/truncate.mixin';
/* eslint-disable max-len */
import {ProgrammeManagement} from '../../intervention-workplan/effective-efficient-programme-mgmt/effectiveEfficientProgrammeMgmt.models';
import {ProgrammeManagementItemMixin} from './programme-management-item-mixin';
import {
  ProgrammeManagementRowExtended,
  ProgrammeManagementKindChoices,
  ProgrammeManagementRowItemExtended
} from './types';

// import {ManagementBudgetItem} from '@unicef-polymer/etools-types';

export function ProgrammeManagementMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ProgrammeManagementClass extends ProgrammeManagementItemMixin(TruncateMixin(baseClass)) {
    // @ts-ignore
    @property({type: Array})
    formattedProgrammeManagement: any[] = [];

    // @ts-ignore
    @property({type: Array})
    originalFormattedProgrammeManagement: any[] = [];

    // @ts-ignore
    @property({type: Object})
    intervention!: Intervention;

    // @ts-ignore
    @property({type: Object})
    permissions!: {
      edit: {
        management_budgets?: boolean;
      };
      required: {
        management_budgets?: boolean;
      };
    };

    // @ts-ignore
    @property({type: Boolean})
    oneEntityInEditMode!: boolean;

    handleEsc!: (event: KeyboardEvent) => void;
    commentMode: any;

    renderProgrammeManagement() {
      if (!this.formattedProgrammeManagement) {
        return '';
      }

      return html`
        ${repeat(
          this.formattedProgrammeManagement || [],
          (item: ProgrammeManagementRowExtended) => item.id,
          (item: ProgrammeManagementRowExtended, itemIndex: number) => html`
            <tbody
              ?hoverable="${!(item.inEditMode || item.itemsInEditMode) &&
              this.permissions.edit.management_budgets &&
              !this.commentMode &&
              !this.oneEntityInEditMode}"
              comment-element="eepm-${item.id}"
              comment-description="${translate('EFFECTIVE_EFFICIENT_PROG_MGM')} - ${item.name}"
            >
              <tr class="header">
                <td></td>
                <td colspan="4">${translate('EFFECTIVE_EFFICIENT_PROG_MGM')}</td>
                <td class="a-right">${translate('PARTNER_CASH')}</td>
                <td>${translate('UNICEF_CASH')}</td>
                <td colspan="2">${translate('GENERAL.TOTAL')}</td>
              </tr>
              <tr class="text action-btns" type="activity">
                <td class="padd-top-10">${item.code}</td>
                <td colspan="4" class="no-top-padding height-for-action-btns">
                  <div class="truncate-multi-line b" title="${item.name}">${item.name}</div>
                  <div class="pad-top-8">
                    <div title="${item.context_details}">${this.truncateString(item.context_details)}</div>
                  </div>
                </td>
                <td class="a-right" tabindex="${item.items && item.items.length ? '-1' : '0'}" class="no-top-padding">
                  <etools-currency-amount-input
                    no-label-float
                    input
                    .value="${item.cso_cash}"
                    tabindex="${ifDefined((item.items && item.items.length) || !item.inEditMode ? '-1' : undefined)}"
                    ?readonly="${this.isReadonlyForProgrammeManagementCash(item.inEditMode, item.items)}"
                    ?required="${this.isRequiredProgrammeManagementCash(item.inEditMode, item.items)}"
                    @keydown="${(e: any) => this.handleEsc(e)}"
                    auto-validate
                    .invalid="${item.invalid?.cso_cash}"
                    error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                    @value-changed="${({detail}: CustomEvent) => this.updateModelValue(item, 'cso_cash', detail.value)}"
                  ></etools-currency-amount-input>
                </td>
                <td tabindex="${item.items && item.items.length ? '-1' : '0'}" class="no-top-padding">
                  <etools-currency-amount-input
                    no-label-float
                    input
                    .value="${item.unicef_cash}"
                    tabindex="${ifDefined((item.items && item.items.length) || !item.inEditMode ? '-1' : undefined)}"
                    ?readonly="${this.isReadonlyForProgrammeManagementCash(item.inEditMode, item.items)}"
                    ?required="${this.isRequiredProgrammeManagementCash(item.inEditMode, item.items)}"
                    auto-validate
                    .invalid="${item.invalid?.unicef_cash}"
                    error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                    @keydown="${(e: any) => this.handleEsc(e)}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.updateModelValue(item, 'unicef_cash', detail.value)}"
                  ></etools-currency-amount-input>
                </td>
                <td
                  colspan="2"
                  class="padd-top-10 action-btns"
                  style="position: relative;"
                  tabindex="${this.permissions.edit.management_budgets ? '0' : '-1'}"
                >
                  <div>
                    ${this.intervention.planned_budget.currency}
                    <span class="b">${displayCurrencyAmount(String(item.totalProgrammeManagementCash), '0', 2)}</span>
                  </div>
                  <div class="action-btns align-bottom flex-h">
                    <paper-icon-button
                      icon="create"
                      ?hidden="${item.inEditMode || !this.permissions.edit.management_budgets}"
                      @click="${(e: any) => {
                        item.inEditMode = true;
                        item.itemsInEditMode = true;
                        this.oneEntityInEditMode = true;
                        this.requestUpdate();
                        // @ts-ignore
                        if (e.isTrusted || this.enterClickedOnActionBtnsTd()) {
                          // If the btn is clicked from code (!e.isTrusted) ,
                          // might be that the focus has to be preserved on the item
                          if (item.items && item.items.length) {
                            this.moveFocusToAddedItemAndAttachListeners(e.target, 'focusBelow');
                          } else {
                            // @ts-ignore
                            this.moveFocusToFirstInput(e.target);
                          }
                        }
                      }}"
                    ></paper-icon-button>
                    <etools-info-tooltip
                      position="top"
                      custom-icon
                      ?hide-tooltip="${item.items?.length || !this.permissions.edit.management_budgets}"
                      style="justify-content:end;"
                    >
                      <paper-icon-button
                        icon="add-box"
                        slot="custom-icon"
                        @click="${(e: CustomEvent) => this.addNewItem(e, item, 'focusBelow')}"
                        ?hidden="${item.items?.length || !this.permissions.edit.management_budgets}"
                      ></paper-icon-button>
                      <span class="no-wrap" slot="message">${translate('ADD_NEW_ITEM')}</span>
                    </etools-info-tooltip>
                  </div>
                  <div
                    class="flex-h justify-right align-bottom"
                    ?hidden="${!(item.inEditMode || item.itemsInEditMode)}"
                  >
                    <paper-button
                      id="btnSave-ProgrammeManagement"
                      ?hidden="${!(item.inEditMode || item.itemsInEditMode)}"
                      @click="${() => this.saveProgrammeManagement(item, this.intervention.id!)}"
                      >${translate('GENERAL.SAVE')}</paper-button
                    >
                    <paper-icon-button
                      icon="close"
                      @click="${() => this.cancelProgrammeManagement(item.items, item, itemIndex)}"
                    ></paper-icon-button>
                  </div>
                </td>
              </tr>
            </tbody>

            <tbody thead ?hidden="${!item.items || !item.items.length}">
              <tr class="header no-padd gray-1">
                <td class="first-col"></td>
                <td class="col-text">${translate('ITEM_DESCRIPTION')}</td>
                <td class="col-unit">${translate('UNIT')}</td>
                <td class="col-unit-no">${translate('NUMBER_UNITS')}</td>
                <td class="col-p-per-unit">${translate('PRICE_UNIT')}</td>
                <td class="col-g">${translate('PARTNER_CASH')}</td>
                <td class="col-g">${translate('UNICEF_CASH')}</td>
                <td class="col-g" colspan="2">${translate('TOTAL')} (${this.intervention.planned_budget.currency})</td>
              </tr>
            </tbody>
            ${this.renderProgrammeManagementItems(item, itemIndex)}
          `
        )}
      `;
    }

    formatProgrammeManagement(data: ProgrammeManagement): ProgrammeManagementRowExtended[] {
      return [
        {
          code: 'EEPM.1',
          name: getTranslation('TITLE_1'),
          context_details: getTranslation('DESCRIPTION_1'),
          cso_cash: data.act1_partner,
          unicef_cash: data.act1_unicef,
          totalProgrammeManagementCash: this.getTotalForProgrammeManagementCash(data.act1_partner, data.act1_unicef),
          total: data.act1_total,
          items: data.items.filter(
            (item: ProgrammeManagementRowItemExtended) => item.kind === ProgrammeManagementKindChoices.inCountry
          ),
          id: 1,
          kind: ProgrammeManagementKindChoices.inCountry,
          inEditMode: false,
          itemsInEditMode: false
        },
        {
          code: 'EEPM.2',
          name: getTranslation('TITLE_2'),
          context_details: getTranslation('DESCRIPTION_2'),
          cso_cash: data.act2_partner,
          unicef_cash: data.act2_unicef,
          totalProgrammeManagementCash: this.getTotalForProgrammeManagementCash(data.act2_partner, data.act2_unicef),
          total: data.act2_total,
          items: data.items.filter(
            (item: ProgrammeManagementRowItemExtended) => item.kind === ProgrammeManagementKindChoices.operational
          ),
          id: 2,
          kind: ProgrammeManagementKindChoices.operational,
          inEditMode: false,
          itemsInEditMode: false
        },
        {
          code: 'EEPM.3',
          name: getTranslation('TITLE_3'),
          context_details: getTranslation('DESCRIPTION_3'),
          cso_cash: data.act3_partner,
          unicef_cash: data.act3_unicef,
          totalProgrammeManagementCash: this.getTotalForProgrammeManagementCash(data.act3_partner, data.act3_unicef),
          total: data.act3_total,
          items: data.items.filter(
            (item: ProgrammeManagementRowItemExtended) => item.kind === ProgrammeManagementKindChoices.planning
          ),
          id: 3,
          kind: ProgrammeManagementKindChoices.planning,
          inEditMode: false,
          itemsInEditMode: false
        }
      ];
    }

    getTotalForProgrammeManagementCash(partner: string, unicef: string): number {
      return (Number(partner) || 0) + (Number(unicef) || 0);
    }

    // @ts-ignore
    cancelProgrammeManagement(
      items: Partial<ProgrammeManagementRowItemExtended>[],
      programmeManagement: ProgrammeManagementRowExtended,
      programmeManagementIndex: number
    ) {
      programmeManagement.invalid = {cso_cash: false, unicef_cash: false};

      programmeManagement.inEditMode = false;
      programmeManagement.itemsInEditMode = false;

      if (!programmeManagement.id) {
        items.shift();
      } else {
        Object.assign(
          programmeManagement,
          cloneDeep(this.originalFormattedProgrammeManagement[programmeManagementIndex])
        );
        this.resetItemsValidations(programmeManagement);
      }
      this.oneEntityInEditMode = false;
      this.requestUpdate();
      // @ts-ignore
      this.lastFocusedTd.focus();
    }

    resetItemsValidations(programmeManagement: ProgrammeManagementRowExtended) {
      if (!programmeManagement.items || !programmeManagement.items.length) {
        return;
      }

      programmeManagement.items.forEach((i: ProgrammeManagementRowItemExtended) => {
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

    updateModelValue(model: any, property: string, newVal: any) {
      if (newVal == model[property]) {
        return;
      }
      model[property] = newVal;
      this.requestUpdate();
    }

    isReadonlyForProgrammeManagementCash(inEditMode: boolean, items?: ProgrammeManagementRowItemExtended[]) {
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

    isRequiredProgrammeManagementCash(inEditMode: boolean, items?: ProgrammeManagementRowItemExtended[]) {
      return inEditMode && !(items && items.length);
    }

    validateProgrammeManagement(programmeManagement: ProgrammeManagementRowExtended) {
      programmeManagement.invalid = {};
      if (!programmeManagement.items || !programmeManagement.items.length) {
        if (programmeManagement.cso_cash === null || programmeManagement.cso_cash === undefined) {
          programmeManagement.invalid.cso_cash = true;
        }
        if (programmeManagement.unicef_cash === null || programmeManagement.cso_cash === undefined) {
          programmeManagement.invalid.unicef_cash = true;
        }
      }
      return !Object.keys(programmeManagement.invalid).length;
    }

    validateProgrammeManagementItems(programmeManagement: ProgrammeManagementRowExtended) {
      if (!programmeManagement.items || !programmeManagement.items.length) {
        return true;
      }

      let invalid = false;
      programmeManagement.items.forEach((item: ProgrammeManagementRowItemExtended) => {
        item.invalid = {};
        item.invalid.name = !item.name;
        item.invalid.unit = !item.unit;
        item.invalid.no_units = !item.no_units || Number(item.no_units) == 0;
        item.invalid.unit_price = !item.unit_price || Number(item.unit_price) == 0;
        if (item.no_units && item.unit_price) {
          this.validateCsoAndUnicefCash(item);
        }
        if (Object.values(item.invalid).some((val: any) => val === true)) {
          invalid = true;
        }
      });
      return !invalid;
    }

    // @ts-ignore
    saveProgrammeManagement(programmeManagement: ProgrammeManagementRowExtended, interventionId: number) {
      if (
        !this.validateProgrammeManagement(programmeManagement) ||
        !this.validateProgrammeManagementItems(programmeManagement)
      ) {
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

      const programmeManagementToSave = cloneDeep(programmeManagement);
      if (programmeManagementToSave.items?.length) {
        // Let backend calculate these
        delete programmeManagementToSave.unicef_cash;
        delete programmeManagementToSave.cso_cash;
      }
      const patchData = cloneDeep(programmeManagement);
      patchData.items = this.formattedProgrammeManagement.flatMap((pm: ProgrammeManagementRowExtended) => pm.items);
      this.formatDataBeforeSave(patchData);

      sendRequest({
        endpoint: getEndpoint(interventionEndpoints.interventionBudgetUpdate, {
          interventionId
        }),
        method: 'PATCH',
        body: patchData
      })
        .then(({intervention}) => {
          this.oneEntityInEditMode = false;
          getStore().dispatch(updateCurrentIntervention(intervention));
        })
        .catch(() => {
          fireEvent(this, 'toast', {text: getTranslation('GENERAL.ERR_OCCURRED')});
        })
        .finally(() => {
          fireEvent(this, 'global-loading', {
            active: false,
            loadingSource: this.localName
          });
        });
    }

    getPropertyName(data: ProgrammeManagementRowExtended, sufix: string) {
      return data ? `act${data.id}_${sufix}` : '';
    }

    formatDataBeforeSave(data: any) {
      data[this.getPropertyName(data, 'partner')] = data.cso_cash;
      data[this.getPropertyName(data, 'unicef')] = data.unicef_cash;
    }
  };
}
