import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-radio-group';
import '@polymer/paper-checkbox';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-input/paper-textarea';
import '@polymer/paper-slider/paper-slider.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import cloneDeep from 'lodash-es/cloneDeep';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {Permission} from '../../common/models/intervention.types';
import {RootState} from '../../common/models/globals.types';
import {getStore} from '../../utils/redux-store-access';
import './financialComponent.models';
import './financialComponent.selectors';
import {FinancialComponentData, FinancialComponentPermissions} from './financialComponent.selectors';
import {selectFinancialComponentPermissions, selectFinancialComponent} from './financialComponent.models';
import {patchIntervention} from '../../common/actions';
import {LabelAndValue} from '../../common/models/globals.types';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {isJsonStrMatch} from '../../utils/utils';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';

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
    if (!this.data) {
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
      </style>
      <etools-content-panel
        show-expand-btn
        panel-title="Financial"
        comment-element="financial"
        comment-description="Financial"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>
        <div class="layout-horizontal padd-top">
          <div class="w100">
            <label class="paper-label">Cash Transfer modality(ies)</label>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v">
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
        <div class="layout-horizontal row-padding-v">
          <div class="w100">
            <label class="paper-label">Headquarters contribution (automatic 7% for INGO)</label>
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
          <div class="w100">
            <label class="paper-label">Document currency</label>
          </div>
        </div>
        <div class="layout-horizontal">
          <div class="col col-3">
            <etools-dropdown
              id="currencyDd"
              option-value="value"
              option-label="label"
              placeholder="&#8212;"
              .options="${this.currencies}"
              .selected="${this.data.planned_budget.currency}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.planned_budget)}"
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                this.data.planned_budget.currency = detail.selectedItem ? detail.selectedItem.value : '';
                this.requestUpdate();
              }}"
              trigger-value-change-event
              no-label-float
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

  interventionId!: number | null;

  get currentInterventionId(): number | null {
    return this.interventionId;
  }

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
    this.data = selectFinancialComponent(state);
    this.originalData = cloneDeep(this.data);
    this.interventionId = state.interventions.current.id;
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
  }

  updateData(value: any, checkValue: string) {
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
      .dispatch(patchIntervention(this.cleanUp(this.data)))
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
