import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-radio-group';
import '@polymer/paper-checkbox';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-input/paper-textarea';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-slider/paper-slider.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import cloneDeep from 'lodash-es/cloneDeep';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {RootState} from '../../common/types/store.types';
import {getStore} from '../../utils/redux-store-access';
import './financialComponent.models';
import './financialComponent.selectors';
import {FinancialComponentData, FinancialComponentPermissions} from './financialComponent.selectors';
import {selectFinancialComponentPermissions, selectFinancialComponent} from './financialComponent.models';
import {patchIntervention} from '../../common/actions/interventions';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {decimalFractionEquals0, isJsonStrMatch} from '../../utils/utils';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, LabelAndValue, Permission} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

/**
 * @customElement
 */
@customElement('financial-component')
export class FinancialComponent extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    // language=HTML
    if (!this.data || !this.cashTransferModalities) {
      return html`<style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      <style>
        ${sharedStyles} :host {
          display: block;
          margin-bottom: 24px;
        }
        .pl-none {
          padding-left: 0px !important;
        }
        paper-slider {
          width: 100%;
          margin-left: -10px;
          margin-top: -5px;
        }

        paper-checkbox[disabled] {
          --paper-checkbox-checked-color: black;
          --paper-checkbox-unchecked-color: black;
          --paper-checkbox-label-color: black;
        }

        .padd-top {
          padding-top: 8px;
        }
        .extra-padd-top {
          padding-top: 16px !important;
        }
        .padd-bott {
          padding-bottom: 16px !important;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
        .grouping-div {
          border-top: 1px solid lightgray;
          margin-bottom: 20px;
          margin-top: 30px;
          width: 10px;
          border-left: 1px solid lightgray;
          border-bottom: 1px solid lightgray;
          margin-right: 6px;
        }
        .hq-info-label {
          color: darkred;
        }       
      </style>
      <etools-content-panel
        show-expand-btn
        panel-title=${translate('INTERVENTION_MANAGEMENT.FINANCIAL_COMPONENT.FINANCIAL')}
        comment-element="financial"
        comment-description=${translate('INTERVENTION_MANAGEMENT.FINANCIAL_COMPONENT.FINANCIAL')}
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>
        <div class="layout-horizontal padd-top">
          <div class="w100">
            <label class="paper-label"
              >${translate('INTERVENTION_MANAGEMENT.FINANCIAL_COMPONENT.CASH_TRANSFER_MOD')}</label
            >
          </div>
        </div>
        <div class="layout-horizontal row-padding-v padd-bott">
          ${this.cashTransferModalities.map(
            (option: LabelAndValue) =>
              html`<div class="col col-3">
                <paper-checkbox
                  ?checked="${this.checkCashTransferModality(option.value)}"
                  ?disabled="${this.isReadonly(this.editMode, true)}"
                  @checked-changed=${(e: CustomEvent) => this.updateData(e.detail.value, option.value)}
                >
                  ${option.label}
                </paper-checkbox>
              </div>`
          )}
        </div>
       

        <div class="layout-horizontal">
          <div class="grouping-div"></div>
          <div>
            <div class="layout-horizontal row-padding-v extra-padd-top">
              <div class="w100">
                <label class="paper-label"
                  >${translate('INTERVENTION_MANAGEMENT.FINANCIAL_COMPONENT.HEADQUARTERS_CONTRIBUTION')}</label
                >
              </div>
            </div>
            <div class="layout-horizontal">
              <div class="col col-3">
                <paper-slider
                  .value="${this.data.hq_support_cost}"
                  width="100%;"
                  max="7"
                  step="0.1"
                  ?disabled="${this.isReadonly(this.editMode, this.permissions.edit.hq_support_cost)}"
                  @value-changed="${(e: CustomEvent) => this.updateSlider(e)}"
                ></paper-slider>
                ${this.data.hq_support_cost}
              </div>
            </div>
            <div class="layout-horizontal row-padding-v">
              <label class="paper-label hq-info-label"><b>${this.data.hq_support_cost}%</b> of the total UNICEF cash contribution is:
                <b>${this.autoCalculatedHqContrib} ${this.data.planned_budget.currency}</b>. Please review and enter the actual final number below.</label
              >
            </div>
            <div class="layout-horizontal">
              <paper-input
                id="hqContrib"
                allowed-pattern="[0-9]"
                placeholder="&#8212;"
                label="HQ Contribution"
                .value="${this.data.planned_budget.total_hq_cash_local}"
                ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.planned_budget)}"
                @value-changed="${({detail}: CustomEvent) => this.hqContribChanged(detail, 'total_hq_cash_local')}"
              >
              </paper-input>
            </div>
          </div>
        </div>

        <div class="layout-horizontal extra-padd-top">
          <div class="col col-3">
            <etools-dropdown
              id="currencyDd"
              option-value="value"
              option-label="label"
              label=${translate('INTERVENTION_MANAGEMENT.FINANCIAL_COMPONENT.DOCUMENT_CURRENCY')}
              placeholder="&#8212;"
              .options="${this.currencies}"
              .selected="${this.data.planned_budget.currency}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.planned_budget)}"
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                if (detail === undefined || detail.selectedItem === null) {
                  return;
                }
                this.data.planned_budget.currency = detail.selectedItem ? detail.selectedItem.value : '';
                this.requestUpdate();
              }}"
              trigger-value-change-event
            >
            </etools-dropdown>
          </div>
        </div>
        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  originalData!: FinancialComponentData;

  @property({type: Object})
  data!: FinancialComponentData;

  @property({type: Object})
  permissions!: Permission<FinancialComponentPermissions>;

  @property({type: Boolean})
  showLoading = false;

  @property({type: Array})
  currencies!: LabelAndValue[];

  @property({type: Array})
  cashTransferModalities!: LabelAndValue[];

  @property({type: String})
  autoCalculatedHqContrib = '0';

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'management')) {
      return;
    }

    if (!state.interventions.current) {
      return;
    }
    this.permissions = selectFinancialComponentPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
    if (!isJsonStrMatch(this.currencies, state.commonData!.currencies)) {
      this.currencies = [...state.commonData!.currencies];
    }
    if (!isJsonStrMatch(this.cashTransferModalities, state.commonData!.cashTransferModalities)) {
      this.cashTransferModalities = [...state.commonData!.cashTransferModalities];
    }
    // const financialCompData = selectFinancialComponent(state);
    // if (!isJsonStrMatch(this.originalData, financialCompData)) {
    //   this.data = cloneDeep(financialCompData);
    //   this.originalData = cloneDeep(financialCompData);
    // }
    // console.log('this.data', this.data);
    console.log('state has changed');
    // console.log(this.data.planned_budget.total_hq_cash_local);
    this.data = selectFinancialComponent(state);
    this.originalData = cloneDeep(this.data);
    this.autoCalculatedHqContrib = this.autoCalcHqContrib();
    super.stateChanged(state);
  }
  
  checkCashTransferModality(value: string) {
    return this.data.cash_transfer_modalities.indexOf(value) > -1;
  }

  updateSlider(e: CustomEvent) {
    if (!e.detail) {
      return;
    }
    this.data = {...this.data, hq_support_cost: e.detail.value} as FinancialComponentData;
    this.autoCalculatedHqContrib = this.autoCalcHqContrib();
      ;
  }

  autoCalcHqContrib() {
    const hqContrib = Number(this.data.planned_budget.total_unicef_cash_local_wo_hq) * (0.01 * Number(this.data.hq_support_cost));
    return this.limitDecimals(hqContrib);
  }

  limitDecimals(initVal: Number) {
    let formatedVal = String(initVal);
    if (initVal < 0.01) {
      formatedVal = initVal.toFixed(4); // Taking into consideration values like 0.0018
    } else {
      formatedVal = initVal.toFixed(2);
    }

    if (decimalFractionEquals0(formatedVal)) {
      formatedVal = formatedVal.substring(0, formatedVal.lastIndexOf('.')); // Removing `.00` form value like `100.00`
    }

    return formatedVal;
  }

 

  // updateHq(e: CustomEvent) {
  //   if (!e.detail) {
  //     return;
  //   }
  //   this.data.planned_budget = {...this.data.planned_budget, total_hq_cash_local: e.detail.value};
  // }

  updateData(value: any, checkValue: string) {
    // const index = this.data.cash_transfer_modalities.indexOf('direct');
    // if (index > -1) {
    //   this.data.cash_transfer_modalities.splice(index, 1);
    // }
    if (value == false) {
      this.data.cash_transfer_modalities = this.data.cash_transfer_modalities.filter((el: string) => el !== checkValue);
    } else if (this.data.cash_transfer_modalities.indexOf(checkValue) === -1) {
      this.data.cash_transfer_modalities.push(checkValue);
    }
    this.data = {...this.data, cash_transfer_modalities: this.data.cash_transfer_modalities} as FinancialComponentData;
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }
    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.cleanUp(this.data)))
      .then(() => {
        this.editMode = false;
      });
  }
  /**
   * Backend errors out otherwise
   */
  cleanUp(data: FinancialComponentData) {
    if (!data || !data.planned_budget) {
      return data;
    }
    data.planned_budget = {id: data.planned_budget.id, currency: data.planned_budget.currency};
    return data;
  }
}
