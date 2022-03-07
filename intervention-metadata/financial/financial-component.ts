import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-radio-group';
import '@polymer/paper-checkbox';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import cloneDeep from 'lodash-es/cloneDeep';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {RootState} from '../../common/types/store.types';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import './financialComponent.models';
import './financialComponent.selectors';
import {FinancialComponentData, FinancialComponentPermissions} from './financialComponent.models';
import {selectFinancialComponentPermissions, selectFinancialComponent} from './financialComponent.selectors';
import {patchIntervention} from '../../common/actions/interventions';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {isJsonStrMatch} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, LabelAndValue, Permission} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {TABS} from '../../common/constants';

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
      return html` ${sharedStyles}
        <etools-loading source="financial" loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }
        .pl-none {
          padding-left: 0px !important;
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
      </style>
      <etools-content-panel
        show-expand-btn
        panel-title=${translate('FINANCIAL')}
        comment-element="financial"
        comment-description=${translate('FINANCIAL')}
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>
        <div class="layout-horizontal padd-top">
          <div class="w100">
            <label class="paper-label">${translate(translatesMap.cash_transfer_modalities)}</label>
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
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Metadata)) {
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
