// @ts-ignore
import {html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import {Constructor} from '@unicef-polymer/etools-types/dist/global.types';
import {ifDefined} from 'lit/directives/if-defined.js';
import {Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import '../time-intervals/time-intervals';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {updateCurrentIntervention} from '../../common/actions/interventions';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {repeat} from 'lit/directives/repeat.js';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {TruncateMixin} from '../../common/mixins/truncate.mixin';
/* eslint-disable max-len */
import {ProgrammeManagement} from '../../intervention-workplan/effective-efficient-programme-mgmt/effectiveEfficientProgrammeMgmt.models';
import {ProgrammeManagementItemMixin} from './programme-management-item-mixin';
import {
  ProgrammeManagementRowExtended,
  ProgrammeManagementKindChoices,
  ProgrammeManagementRowItemExtended
} from '../../common/types/editor-page-types';
import {getTotalCash, getTotalCashFormatted} from '../../common/components/activity/get-total.helper';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';

// import {ManagementBudgetItem} from '@unicef-polymer/etools-types';

export function ProgrammeManagementMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ProgrammeManagementClass extends ProgrammeManagementItemMixin(TruncateMixin(MatomoMixin(baseClass))) {
    // @ts-ignore
    @property({type: Array})
    formattedProgrammeManagement: any[] = [];

    // @ts-ignore
    @property({type: Object})
    originalProgMgmt: any;

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
        <tbody>
          <tr class="eepm-header lighter-blue">
            <td></td>
            <td colspan="8">${translate('EFFECTIVE_EFFICIENT_PROG_MGM')}</td>
          </tr>
        </tbody>
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
              ?inEditMode="${item.inEditMode || item.itemsInEditMode}"
            >
              <tr class="header" type="eepm-activity">
                <td></td>
                <td colspan="4">${translate('ACTIVITY')}</td>
                <td class="a-right">${translate('PARTNER_CASH')}</td>
                <td>${translate('UNICEF_CASH')}</td>
                <td colspan="2">${translate('GENERAL.TOTAL')}</td>
              </tr>
              <tr class="text action-btns" type="activity">
                <td class="index-column">
                  <etools-input
                    title="${item.code}"
                    no-label-float
                    readonly
                    tabindex="-1"
                    .value="${item.code}"
                  ></etools-input>
                </td>
                <td
                  colspan="4"
                  tabindex="${ifDefined(this.commentMode ? undefined : '0')}"
                  class="no-top-padding height-for-action-btns"
                >
                  <div class="truncate-multi-line b" title="${item.name}">${item.name}</div>
                  <div class="pad-top-8">
                    <div title="${item.context_details}">${this.truncateString(item.context_details)}</div>
                  </div>
                </td>
                <td
                  class="a-right no-top-padding"
                  tabindex="${ifDefined((item.items && item.items.length) || this.commentMode ? undefined : '0')}"
                >
                  <etools-currency
                    no-label-float
                    input
                    .value="${item.cso_cash}"
                    tabindex="${ifDefined((item.items && item.items.length) || !item.inEditMode ? '-1' : undefined)}"
                    ?readonly="${this.isReadonlyCash(item.inEditMode, item.items)}"
                    ?required="${this.isRequiredCash(item.inEditMode, item.items)}"
                    @keydown="${(e: any) => this.handleEsc(e)}"
                    auto-validate
                    .invalid="${item.invalid?.cso_cash}"
                    error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                    @value-changed="${({detail}: CustomEvent) => this.numberChanged(detail, 'cso_cash', item)}"
                  ></etools-currency>
                </td>
                <td
                  tabindex="${ifDefined((item.items && item.items.length) || this.commentMode ? undefined : '0')}"
                  class="no-top-padding"
                >
                  <etools-currency
                    no-label-float
                    input
                    .value="${item.unicef_cash}"
                    tabindex="${ifDefined((item.items && item.items.length) || !item.inEditMode ? '0' : undefined)}"
                    ?readonly="${this.isReadonlyCash(item.inEditMode, item.items)}"
                    ?required="${this.isRequiredCash(item.inEditMode, item.items)}"
                    auto-validate
                    .invalid="${item.invalid?.unicef_cash}"
                    error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                    @keydown="${(e: any) => this.handleEsc(e)}"
                    @value-changed="${({detail}: CustomEvent) => this.numberChanged(detail, 'unicef_cash', item)}"
                  ></etools-currency>
                </td>
                <td
                  colspan="2"
                  class="padd-top-10 action-btns"
                  style="position: relative;"
                  tabindex="${ifDefined(
                    !this.permissions.edit.management_budgets || this.commentMode ? undefined : '0'
                  )}"
                >
                  <div>
                    ${this.intervention.planned_budget.currency}
                    <span class="b">${getTotalCashFormatted(item.cso_cash, item.unicef_cash)}</span>
                  </div>
                  <div class="action-btns align-bottom flex-h">
                    <etools-icon-button
                      name="create"
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
                    ></etools-icon-button>

                    <sl-tooltip
                      ?hidden="${item.items?.length || !this.permissions.edit.management_budgets}"
                      placement="top"
                      content="${translate('ADD_NEW_ITEM')}"
                    >
                      <etools-icon-button
                        id="add-item-${item.id}"
                        name="add-box"
                        @click="${(e: CustomEvent) => this.addNewItem(e, item, 'focusBelow')}"
                        ?hidden="${item.items?.length || !this.permissions.edit.management_budgets}"
                      ></etools-icon-button>
                    </sl-tooltip>
                  </div>
                  <div
                    class="flex-h justify-right align-bottom"
                    ?hidden="${!(item.inEditMode || item.itemsInEditMode)}"
                  >
                    <etools-button
                      variant="primary"
                      id="btnSave-ProgrammeManagement"
                      ?hidden="${!(item.inEditMode || item.itemsInEditMode)}"
                      @click="${(e: any) => this.saveProgrammeManagement(e, item, this.intervention.id!)}"
                      tracker="WorkplanEditor Save ProgrammeManagement"
                      >${translate('GENERAL.SAVE')}</etools-button
                    >
                    <etools-icon-button
                      name="close"
                      @click="${() => this.cancelProgrammeManagement(item.items, item, itemIndex)}"
                    ></etools-icon-button>
                  </div>
                </td>
              </tr>
            </tbody>

            <tbody thead ?hidden="${!item.items || !item.items.length}">
              <tr class="header no-padd gray-1" ?inEditMode="${item.inEditMode || item.itemsInEditMode}">
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
          totalProgrammeManagementCash: getTotalCash(data.act1_partner, data.act1_unicef),
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
          totalProgrammeManagementCash: getTotalCash(data.act2_partner, data.act2_unicef),
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
          totalProgrammeManagementCash: getTotalCash(data.act3_partner, data.act3_unicef),
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

    // @ts-ignore
    saveProgrammeManagement(
      e: CustomEvent,
      programmeManagement: ProgrammeManagementRowExtended,
      interventionId: number
    ) {
      if (!this.validateProgrammeManagement(programmeManagement) || !this.validateActivityItems(programmeManagement)) {
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
      this.trackAnalytics(e);
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
  }

  return ProgrammeManagementClass;
}
