import {html, LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';

import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {resetRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {patchIntervention} from '../../common/actions/interventions';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {RootState} from '../../common/types/store.types';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, LabelAndValue, Permission} from '@unicef-polymer/etools-types';
import {listenForLangChanged, translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {OtherData, OtherPermissions} from './other.models';
import {selectOtherData, selectOtherPermissions} from './other.selectors';
import CONSTANTS from '../../common/constants';
import {translatesMap} from '../../utils/intervention-labels-map';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.component';
import {EtoolsInput} from '@unicef-polymer/etools-unicef/src/etools-input/etools-input';

/**
 * @customElement
 */
@customElement('other-metadata')
export class Other extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    if (!this.data || !this.permissions) {
      return html` ${sharedStyles}
        <etools-loading source="other" active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }

        .row {
          position: relative;
          display: flex;
          padding: 3px 0;
        }

        .row > * {
          padding-inline-start: 40px;
          box-sizing: border-box;
        }

        sl-switch#confidential {
          margin-top: 25px;
        }

        #iit-confidential {
          margin-top: 20px;
          margin-inline-start: 8px;
        }

        etools-textarea::part(textarea) {
          max-height: 96px;
          overflow-y: auto;
        }
        .confidential-row {
          margin-top: -4px;
          padding-bottom: 12px;
        }
        etools-input {
          width: 100%;
        }
      </style>

      <etools-content-panel show-expand-btn panel-title=${translate('OTHER')} comment-element="other-metadata">
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row">
          <!--   Document Type   -->
          <div class="col-md-4 col-12">
            <etools-dropdown
              id="documentType"
              label=${translate('DOC_TYPE')}
              placeholder="&#8212;"
              ?readonly="${!this.documentTypes.length ||
              this.isReadonly(this.editMode, this.permissions?.edit.document_type)}"
              tabindex="${!this.documentTypes.length ||
              this.isReadonly(this.editMode, this.permissions?.edit.document_type)
                ? -1
                : undefined}"
              required
              .options="${this.documentTypes}"
              .selected="${this.data.document_type}"
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                if (!detail.selectedItem) {
                  return;
                }
                this.documentTypeChanged(detail.selectedItem && detail.selectedItem.value);
              }}"
              trigger-value-change-event
              hide-search
              @focus="${() => resetRequiredFields(this)}"
              @click="${() => resetRequiredFields(this)}"
            >
            </etools-dropdown>
          </div>
          <!--   SPD is Humanitarian   -->
          <div class="col-md-8 col-12">
            <sl-switch
              ?hidden="${!this.isSPD}"
              ?disabled="${this.isReadonly(this.editMode, this.permissions?.edit.document_type)}"
              ?checked="${this.data.humanitarian_flag}"
              @sl-change="${(e: CustomEvent) => {
                this.data.contingency_pd = false;
                this.valueChanged({value: (e.target as SlSwitch).checked}, 'humanitarian_flag');
              }}"
            >
              ${translate('SPD_HUMANITARIAN')}
            </sl-switch>
          </div>

          <!--   Contingency Document   -->
          <div class="col-md-4 col-12" ?hidden="${!this.data.humanitarian_flag}">
            <sl-switch
              ?disabled="${this.isReadonly(this.editMode, this.permissions?.edit.document_type)}"
              ?checked="${this.data.contingency_pd}"
              @sl-change="${(e: CustomEvent) => {
                this.valueChanged({value: (e.target as SlSwitch).checked}, 'contingency_pd');
                if (!(e.target as SlSwitch).checked) {
                  this.data.activation_protocol = '';
                }
              }}"
            >
              ${translate('CONTINGENCY_DOC')}
            </sl-switch>
          </div>

          <div class="col-12" ?hidden="${!this.data.contingency_pd}">
            <etools-textarea
              class="w100"
              label=${translate('ACTIVATION_PROTOCOL')}
              placeholder="&#8212;"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.document_type)}"
              ?required="${this.data.contingency_pd}"
              .autoValidate="${this.autoValidateProtocol}"
              @focus="${() => (this.autoValidateProtocol = true)}"
              .value="${this.data.activation_protocol}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'activation_protocol')}"
            >
            </etools-textarea>
          </div>

          <div class="col-md-4 col-12">
            <etools-dropdown
              id="currencyDd"
              option-value="value"
              option-label="label"
              label=${translate(translatesMap.currency)}
              placeholder="&#8212;"
              .options="${this.currencies}"
              .selected="${this.data.planned_budget.currency}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.document_currency)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.document_currency) ? -1 : undefined}"
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
          <div class="col-md-6 col-12">
            <etools-input
              id="unppNumber"
              pattern="CEF/[a-zA-Z]{3}/\\d{4}/\\d{3}"
              label=${translate('UNPP_CFEI_DSR_REF_NUM')}
              placeholder="CEF/___/____/___"
              .value="${this.data.cfei_number}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.cfei_number)}"
              error-message="${translate('CFEI_EXPECTED_FORMAT')}"
              @blur="${(ev: CustomEvent) => this.validateCFEI(ev)}"
              @value-changed="${({detail}: CustomEvent) => this.cfeiValueChanged(detail, 'cfei_number')}"
            ></etools-input>
          </div>
          <div class="col-12" ?hidden="${!this.permissions?.view?.confidential}">
            <sl-switch
              id="confidential"
              ?disabled="${this.isReadonly(this.editMode, this.permissions?.edit?.confidential)}"
              ?checked="${this.data.confidential}"
              @sl-change="${(e: CustomEvent) =>
                this.valueChanged({value: (e.target! as SlSwitch).checked}, 'confidential')}}"
            >
              ${translate('CONFIDENTIAL')}
            </sl-switch>
            <info-icon-tooltip
              id="iit-confidential"
              ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit?.confidential)}"
              .tooltipText="${translate('CONFIDENTIAL_INFO')}"
            ></info-icon-tooltip>
          </div>
        </div>
        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Boolean})
  autoValidate = false;

  @property({type: Object})
  originalData!: OtherData;

  @property({type: Object})
  data!: OtherData;

  @property({type: Object})
  permissions!: Permission<OtherPermissions>;

  @property({type: Boolean})
  showLoading = false;

  @property({type: Array})
  documentTypes: LabelAndValue[] = [];

  @property({type: Array})
  currencies!: LabelAndValue[];

  @property({type: Boolean})
  autoValidateProtocol = false;

  get isSPD(): boolean {
    return this.data.document_type === CONSTANTS.DOCUMENT_TYPES.SPD;
  }

  constructor() {
    super();
    listenForLangChanged(this.handleLanguageChanged.bind(this));
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('editMode') && !this.editMode) {
      // reset validation for #unppNumber field
      const elem = this.shadowRoot?.querySelector<EtoolsInput>('#unppNumber')!;
      if (elem) {
        elem.invalid = false;
      }
    }
  }
  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'metadata')) {
      return;
    }
    if (!state.interventions.current) {
      return;
    }
    if (!isJsonStrMatch(this.currencies, state.commonData!.currencies)) {
      this.currencies = [...state.commonData!.currencies];
    }
    if (!isJsonStrMatch(this.documentTypes, state.commonData!.documentTypes)) {
      this.documentTypes = [
        ...state.commonData!.documentTypes.map((x: any) => ({
          ...x,
          label: getTranslatedValue(x.label, 'ITEM_TYPE')
        }))
      ];
    }
    this.data = selectOtherData(state);
    this.originalData = cloneDeep(this.data);
    this.setPermissions(state);
    super.stateChanged(state);
  }

  handleLanguageChanged() {
    this.documentTypes = [
      ...getStore()
        .getState()
        .commonData!.documentTypes.map((x: any) => ({
          ...x,
          label: getTranslatedValue(x.label, 'ITEM_TYPE')
        }))
    ];
  }

  private setPermissions(state: any) {
    this.permissions = selectOtherPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
  }

  documentTypeChanged(type: string) {
    if (type !== CONSTANTS.DOCUMENT_TYPES.SPD) {
      this.data.humanitarian_flag = false;
      this.data.contingency_pd = false;
      this.data.activation_protocol = '';
    }
    this.data.document_type = type;
    this.requestUpdate();
  }

  validateCFEI(e?: CustomEvent) {
    const elem = e ? (e.currentTarget as EtoolsInput) : this.shadowRoot?.querySelector<EtoolsInput>('#unppNumber')!;
    return elem.validate();
  }

  cfeiValueChanged(detail: any, field: string) {
    this.valueChanged(detail, field);
    if (detail.value && detail.value.length === 16) {
      this.validateCFEI();
    }
  }

  saveData() {
    if (!this.validate() || !this.validateCFEI()) {
      return Promise.resolve(false);
    }

    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.cleanUp(cloneDeep(this.data))))
      .then(() => {
        this.editMode = false;
      });
  }

  /**
   * Backend errors out otherwise
   */
  cleanUp(data: OtherData) {
    if (!data || !data.planned_budget) {
      return data;
    }
    return this.removeUnchangedData(data);
  }

  removeUnchangedData(data: OtherData) {
    Object.keys(data).forEach((key) => {
      if (key == 'planned_budget') {
        if (!this.permissions.edit.document_currency) {
          // @ts-ignore
          delete data.planned_budget;
        } else {
          data.planned_budget = {
            id: data.planned_budget.id,
            currency: data.planned_budget.currency
          };
        }
      }
      // @ts-ignore
      if (this.originalData[key] == data[key]) {
        // @ts-ignore
        delete data[key];
      }
    });
    return data;
  }
}
