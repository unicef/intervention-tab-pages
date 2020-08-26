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
import {getStore} from '../../utils/redux-store-access';
import {connect} from 'pwa-helpers/connect-mixin';
import './financialComponent.models';
import './financialComponent.selectors';
import {FinancialComponentData, FinancialComponentPermissions} from './financialComponent.selectors';
import {selectFinancialComponentPermissions, selectFinancialComponent} from './financialComponent.models';
import {patchIntervention} from '../../common/actions';

/**
 * @customElement
 */
@customElement('financial-component')
export class FinancialComponent extends connect(getStore())(ComponentBaseMixin(LitElement)) {
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
      </style>
      <etools-content-panel show-expand-btn panel-title="Financial">
        <div slot="panel-btns">
          ${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="w100">
            <label class="paper-label">Cash Transfer modality(ies)</label>
          </div>
        </div>
        <div class="layout-horizontal">
          <div class="col col-3">
            <paper-checkbox
              ?checked="${this.checkCashTransferModality('Direct Cash Transfer')}"
              ?disabled="${this.isReadonly(this.editMode, this.permissions.edit.cash_transfer_modalities)}"
              @checked-changed=${(e: CustomEvent) => this.updateData(e.detail.value, 'Direct Cash Transfer')}
            >
              Direct Cash Transfer
            </paper-checkbox>
          </div>
          <div class="col col-3">
            <paper-checkbox
              ?checked="${this.checkCashTransferModality('Direct Payment')}"
              ?disabled="${this.isReadonly(this.editMode, this.permissions.edit.cash_transfer_modalities)}"
              @checked-changed=${(e: CustomEvent) => this.updateData(e.detail.value, 'Direct Payment')}
            >
              Direct Payment
            </paper-checkbox>
          </div>
          <div class="col col-3">
            <paper-checkbox
              ?checked="${this.checkCashTransferModality('Reimbursement')}"
              ?disabled="${this.isReadonly(this.editMode, this.permissions.edit.cash_transfer_modalities)}"
              @checked-changed=${(e: CustomEvent) => this.updateData(e.detail.value, 'Reimbursement')}
            >
              Reimbursement
            </paper-checkbox>
          </div>
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
            ${this.data.currency}
          </div>
        </div>
        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Boolean})
  canEditHQOriginal!: boolean;

  @property({type: Boolean})
  canEditCashTransferOriginal!: boolean;

  @property({type: Object})
  originalData!: FinancialComponentData;

  @property({type: Object})
  data!: FinancialComponentData;

  @property({type: String})
  currency!: string;

  @property({type: Object})
  permissions!: Permission<FinancialComponentPermissions>;

  @property({type: Boolean})
  showLoading = false;

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: any) {
    if (!state.interventions.current) {
      return;
    }
    // temporary fix untill we have data from backend
    state.interventions.current.hq_support_cost = 0;
    this.data = selectFinancialComponent(state);
    this.permissions = selectFinancialComponentPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
    this.originalData = cloneDeep(this.data);
  }

  // @lajos: this will have to be reviewd
  checkCashTransferModality(value: string) {
    if (!value) {
      return;
    }
    if (this.data!.cash_tranfer_modalities.indexOf(value) > -1) {
      return true;
    }
    return false;
  }

  updateSlider(e: CustomEvent) {
    if (!e.detail) {
      return;
    }
    this.data = {...this.data, hq_support_cost: e.detail.value} as FinancialComponentData;
  }

  updateData(value: any, checkbox: string) {
    if (value == false) {
      this.data.cash_tranfer_modalities = this.data.cash_tranfer_modalities.replace(checkbox, '');
    } else {
      this.data.cash_tranfer_modalities += ' ' + checkbox;
    }
  }

  // this will be reviewed after all backend data is available
  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }
    return getStore()
      .dispatch(patchIntervention(this.data))
      .then(() => {
        this.editMode = false;
      });
  }
}
