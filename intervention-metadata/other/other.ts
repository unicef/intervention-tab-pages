import {customElement, html, LitElement, property} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-loading/etools-loading';
import {gridLayoutStylesLit} from '../../../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../../../common/styles/button-styles';
import {sharedStyles} from '../../../../common/styles/shared-styles-lit';
import {resetRequiredFields} from '../../../../common/utils/validation-helper';
import {getStore} from '../../../../common/utils/redux-store-access';
import ComponentBaseMixin from '../../../../common/mixins/component-base-mixin';
import {patchIntervention} from '../../common/actions/interventions';
import {isJsonStrMatch} from '../../../../common/utils/utils';
import {pageIsNotCurrentlyActive} from '../../../../common/utils/common-methods';
import {RootState} from '../../common/types/store.types';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, LabelAndValue, Permission} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {OtherData, OtherPermissions} from './other.models';
import {selectOtherData, selectOtherPermissions} from './other.selectors';
import CONSTANTS from '../../common/constants';
import {translatesMap} from '../../../../common/utils/intervention-labels-map';

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
      return html`<style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
      <style>
        ${sharedStyles} :host {
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
          padding-left: 40px;
          box-sizing: border-box;
        }

        paper-toggle-button {
          margin: 25px 0;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('OTHER')}
        comment-element="other-metadata"
        comment-description=${translate('OTHER')}
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="layout-horizontal row-padding-v">
          <!--   Document Type   -->
          <div class="col col-4">
            <etools-dropdown
              id="documentType"
              label=${translate('DOC_TYPE')}
              placeholder="&#8212;"
              ?readonly="${!this.documentTypes.length ||
              this.isReadonly(this.editMode, this.permissions.edit.document_type)}"
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
                  ?disabled="${this.isReadonly(this.editMode, this.permissions.edit.document_type)}"
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
                  ?disabled="${this.isReadonly(this.editMode, this.permissions.edit.document_type)}"
                  ?checked="${this.data.contingency_pd}"
                  @checked-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'contingency_pd')}"
                >
                  ${translate('CONTINGENCY_DOC')}
                </paper-toggle-button>
              </div>
            </div>
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

  get isSPD(): boolean {
    return this.data.document_type === CONSTANTS.DOCUMENT_TYPES.SPD;
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'metadata')) {
      return;
    }
    if (!state.interventions.current) {
      return;
    }
    if (!isJsonStrMatch(this.currencies, state.commonData!.currencies)) {
      this.currencies = [...state.commonData!.currencies];
    }
    if (!isJsonStrMatch(this.documentTypes, state.commonData!.documentTypes)) {
      this.documentTypes = [...state.commonData!.documentTypes];
    }
    this.data = selectOtherData(state);
    this.originalData = cloneDeep(this.data);
    this.setPermissions(state);
    super.stateChanged(state);
  }

  private setPermissions(state: any) {
    this.permissions = selectOtherPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
  }

  documentTypeChanged(type: string) {
    if (type !== CONSTANTS.DOCUMENT_TYPES.SPD) {
      this.data.humanitarian_flag = false;
      this.data.contingency_pd = false;
    }
    this.data.document_type = type;
    this.requestUpdate();
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
  cleanUp(data: OtherData) {
    if (!data || !data.planned_budget) {
      return data;
    }
    data.planned_budget = {
      id: data.planned_budget.id,
      currency: data.planned_budget.currency
    };
    return data;
  }
}
