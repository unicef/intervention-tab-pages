import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import cloneDeep from 'lodash-es/cloneDeep';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {RootState} from '../../common/types/store.types';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import './financialComponent.models';
import './financialComponent.selectors';
import {FinancialComponentData, FinancialComponentPermissions} from './financialComponent.models';
import {selectFinancialComponentPermissions, selectFinancialComponent} from './financialComponent.selectors';
import {patchIntervention} from '../../common/actions/interventions';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, LabelAndValue, Permission} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {TABS} from '../../common/constants';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';

/**
 * @customElement
 */
@customElement('financial-component')
export class FinancialComponent extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    // language=HTML
    if (!this.data || !this.cashTransferModalities) {
      return html` ${sharedStyles}
        <etools-loading source="financial" active></etools-loading>`;
    }
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }
        .pl-none {
          padding-inline-start: 0px !important;
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
      </style>
      <etools-content-panel show-expand-btn panel-title=${translate('FINANCIAL')} comment-element="financial">
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>
        <div class="layout-horizontal padd-top">
          <div class="w100">
            <label class="label">${translate(translatesMap.cash_transfer_modalities)}</label>
          </div>
        </div>
        <div class="row">
          ${this.cashTransferModalities.map(
            (option: LabelAndValue) =>
              html`<div class="col-lg-4 col-md-6 col-12">
                <etools-checkbox
                  ?checked="${this.checkCashTransferModality(option.value)}"
                  ?disabled="${this.isReadonly(this.editMode, true)}"
                  @sl-change=${(e: any) => this.updateData(e.target.checked, option.value)}
                >
                  ${translateValue(option.label, 'CASH_TRANSFER_MODALITIES')}
                </etools-checkbox>
              </div>`
          )}
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

  @property({type: Array})
  cashTransferModalities!: LabelAndValue[];

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Metadata)) {
      return;
    }

    if (!state.interventions.current) {
      return;
    }
    this.permissions = selectFinancialComponentPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
    if (!isJsonStrMatch(this.cashTransferModalities, state.commonData!.cashTransferModalities)) {
      this.cashTransferModalities = [...state.commonData!.cashTransferModalities];
    }
    this.data = selectFinancialComponent(state);
    this.originalData = cloneDeep(this.data);
    super.stateChanged(state);
  }

  checkCashTransferModality(value: string) {
    return this.data.cash_transfer_modalities.indexOf(value) > -1;
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
      .dispatch<AsyncAction>(patchIntervention(this.cleanUpData(this.data)))
      .then(() => {
        this.editMode = false;
      });
  }

  cleanUpData(data: any) {
    // 'direct' is an old option that is still around in the db and causes errors
    const index = data.cash_transfer_modalities.indexOf('direct');
    if (index > -1) {
      data.cash_transfer_modalities.splice(index, 1);
    }
    return data;
  }
}
