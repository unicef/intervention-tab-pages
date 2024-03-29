import {customElement, html, LitElement, property} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-loading/etools-loading';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
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
import {listenForLangChanged, translate} from 'lit-translate';
import {OtherData, OtherPermissions} from './other.models';
import {selectOtherData, selectOtherPermissions} from './other.selectors';
import CONSTANTS from '../../common/constants';
import {translatesMap} from '../../utils/intervention-labels-map';
import '@polymer/paper-input/paper-textarea';
import '@polymer/paper-input/paper-input';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {PaperInputElement} from '@polymer/paper-input/paper-input';

/**
 * @customElement
 */
@customElement('other-metadata')
export class Other extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
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

        paper-toggle-button {
          margin-top: 25px;
        }

        #iit-confidential {
          margin-top: 20px;
          margin-inline-start: 8px;
        }
        paper-textarea {
          outline: none;
          --paper-input-container-input: {
            display: block;
            text-overflow: hidden;
          }

          --iron-autogrow-textarea: {
            overflow: auto;
            padding: 0;
            max-height: 96px;
          }
        }
        .confidential-row {
          margin-top: -4px;
          padding-bottom: 12px;
        }
        paper-input {
          width: 100%;
        }
      </style>

      <etools-content-panel show-expand-btn panel-title=${translate('OTHER')} comment-element="other-metadata">
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="layout-horizontal row-padding-v">
          <!--   Document Type   -->
          <div class="col col-4">
            <etools-dropdown
              id="documentType"
              label=${translate('DOC_TYPE')}
              placeholder="&#8212;"
              ?readonly="${!this.documentTypes.length ||
              this.isReadonly(this.editMode, this.permissions?.edit.document_type)}"
              tabindex="${!this.documentTypes.length ||
              this.isReadonly(this.editMode, this.permissions?.edit.document_type)
                ? -1
                : 0}"
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
          <div class="col-8">
            <div class="row">
              <!--   SPD is Humanitarian   -->
              <div ?hidden="${!this.isSPD}">
                <paper-toggle-button
                  ?disabled="${this.isReadonly(this.editMode, this.permissions?.edit.document_type)}"
                  ?checked="${this.data.humanitarian_flag}"
                  @checked-changed="${({detail}: CustomEvent) => {
                    this.data.contingency_pd = false;
                    this.valueChanged(detail, 'humanitarian_flag');
                  }}"
                >
                  ${translate('SPD_HUMANITARIAN')}
                </paper-toggle-button>
              </div>

              <!--   Contingency Document   -->
              <div ?hidden="${!this.data.humanitarian_flag}">
                <paper-toggle-button
                  ?disabled="${this.isReadonly(this.editMode, this.permissions?.edit.document_type)}"
                  ?checked="${this.data.contingency_pd}"
                  @checked-changed="${({detail}: CustomEvent) => {
                    this.valueChanged(detail, 'contingency_pd');
                    this.data.activation_protocol = '';
                  }}"
                >
                  ${translate('CONTINGENCY_DOC')}
                </paper-toggle-button>
              </div>
            </div>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v" ?hidden="${!this.data.contingency_pd}">
          <div class="col col-10">
            <paper-textarea
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
            </paper-textarea>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-4">
            <etools-dropdown
              id="currencyDd"
              option-value="value"
              option-label="label"
              label=${translate(translatesMap.currency)}
              placeholder="&#8212;"
              .options="${this.currencies}"
              .selected="${this.data.planned_budget.currency}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.document_currency)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.document_currency) ? -1 : 0}"
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
          <div class="col col-6" style="padding-inline-start: 40px;">
            <paper-input
              id="unppNumber"
              pattern="CEF/[a-zA-Z]{3}/\\d{4}/\\d{3}"
              label=${translate('UNPP_CFEI_DSR_REF_NUM')}
              placeholder="CEF/___/____/___"
              .value="${this.data.cfei_number}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.cfei_number)}"
              error-message="${translate('CFEI_EXPECTED_FORMAT')}"
              @blur="${(ev: CustomEvent) => this.validateCFEI(ev)}"
              @value-changed="${({detail}: CustomEvent) => this.cfeiValueChanged(detail, 'cfei_number')}"
            ></paper-input>
          </div>
        </div>

        <div class="layout-horizontal confidential-row" ?hidden="${!this.permissions?.view?.confidential}">
          <paper-toggle-button
            id="confidential"
            ?disabled="${this.isReadonly(this.editMode, this.permissions?.edit?.confidential)}"
            ?checked="${this.data.confidential}"
            @checked-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'confidential')}}"
          >
            ${translate('CONFIDENTIAL')}
          </paper-toggle-button>
          <info-icon-tooltip
            id="iit-confidential"
            ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit?.confidential)}"
            .tooltipText="${translate('CONFIDENTIAL_INFO')}"
          ></info-icon-tooltip>
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
    const elem = e
      ? (e.currentTarget as PaperInputElement)
      : this.shadowRoot?.querySelector<PaperInputElement>('#unppNumber')!;
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
