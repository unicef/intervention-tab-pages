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
import {validateRequiredFields} from '../../utils/validation-helper';
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
        }
      </style>
      <etools-content-panel show-expand-btn panel-title="Financial">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>
        <div slot="panel-btns">
          <paper-icon-button
            ?hidden="${this.hideEditIcon(this.editMode, this.canEditFinancialComponent)}"
            @tap="${this.allowEdit}"
            icon="create"
          >
          </paper-icon-button>
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="w100">
            <label class="paper-label">Cash Transfer modality(ies)</label>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v">
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
        <div class="layout-horizontal row-padding-v">
          <div class="col col-4">
            <paper-slider
              .value="${this.hq_support_cost}"
              width="100%;"
              max="7"
              step="0.1"
              ?disabled="${this.isReadonly(this.editMode, this.permissions.edit.hq_support_cost)}"
              @value-changed="${(e: CustomEvent) => this.updateSlider(e)}"
            ></paper-slider>
            ${this.hq_support_cost}
          </div>
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="w100">
            <label class="paper-label">Document currency</label>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-3">
            ${this.currency}
          </div>
        </div>
        <div
          class="layout-horizontal right-align row-padding-v"
          ?hidden="${this.hideActionButtons(this.editMode, this.canEditFinancialComponent)}"
        >
          <paper-button class="default" @tap="${this.cancel}">
            Cancel
          </paper-button>
          <paper-button class="primary" @tap="${this.save()}">
            Save
          </paper-button>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Boolean})
  canEditFinancialComponent!: boolean;

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

  @property({type: String})
  _hq_support_cost!: string;

  set hq_support_cost(val) {
    this._hq_support_cost = val;
  }

  get hq_support_cost() {
    return this._hq_support_cost;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: any) {
    if (!state.interventions.current) {
      return;
    }
    if (state.interventions.current) {
      this.data = selectFinancialComponent(state);
      this.permissions = selectFinancialComponentPermissions(state);
      this.currency = state.interventions.current.planned_budget.currency;
      this.setCanEditFinancialData(this.permissions.edit);
      this.originalData = cloneDeep(this.data);
      if (this.data.hq_support_cost) {
        this._hq_support_cost = this.data.hq_support_cost;
      } else {
        this._hq_support_cost = '0';
        this.data.hq_support_cost = '0';
      }
      this.originalData = cloneDeep(this.data);
    }
  }

  setCanEditFinancialData(editPermissions: FinancialComponentPermissions) {
    this.canEditFinancialComponent = editPermissions.cash_transfer_modalities || editPermissions.hq_support_cost;
  }

  validate() {
    return validateRequiredFields(this);
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

  allowEdit() {
    this.editMode = true;
  }

  cancel() {
    this.editMode = false;
    this.data = cloneDeep(this.originalData);
    this._hq_support_cost = this.data.hq_support_cost;
    // this is temporary until we find a better fix for it
    this.requestUpdate();
  }

  updateSlider(e: CustomEvent) {
    if (!e.detail) {
      return;
    }
    this._hq_support_cost = e.detail.value;
  }

  updateData(value: any, checkbox: string) {
    if (value == false) {
      this.data.cash_tranfer_modalities = this.data.cash_tranfer_modalities.replace(checkbox, '');
    } else {
      this.data.cash_tranfer_modalities += ' ' + checkbox;
    }
  }

  // this will be reviewed after all backend data is available
  save() {
    if (!this.validate()) {
      return;
    }
    getStore()
      .dispatch(patchIntervention(this.data))
      .then(() => {
        this.editMode = false;
      });
  }
}
