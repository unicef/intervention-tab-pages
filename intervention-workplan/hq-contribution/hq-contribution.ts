import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';

import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@shoelace-style/shoelace/dist/components/range/range.js';
import {buttonsStyles} from '@unicef-polymer/etools-unicef/src/styles/button-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {selectHqContributionData, selectHqContributionPermissions} from './hqContribution.selectors';
import {HqContributionData, HqContributionPermissions} from './hqContribution.models';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {patchIntervention} from '../../common/actions/interventions';
import cloneDeep from 'lodash-es/cloneDeep';
import {RootState} from '../../common/types/store.types';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {decimalFractionEquals0} from '@unicef-polymer/etools-utils/dist/general.util';
import {areEqual} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, Permission} from '@unicef-polymer/etools-types';
import {translate, translateUnsafeHTML} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {TABS} from '../../common/constants';
import {getPageDirection} from '../../utils/utils';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input.js';

/**
 * @customElement
 */
@customElement('hq-contribution')
export class HqContributionElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    if (!this.data || !this.permissions) {
      return html` ${sharedStyles}
        <etools-loading source="hq" active></etools-loading>`;
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
        .extra-padd-top-no-bottom {
          padding-top: 16px !important;
          padding-bottom: 0 !important;
        }
        sl-range {
          width: 85%;
          margin-top: 10px;
          --track-color-active: var(--primary-color);
        }
        .hq-info-label {
          color: darkred;
          padding-bottom: 5px;
        }
        etools-input {
          width: 3.5rem;
        }
        .space-betw {
          justify-content: space-between;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('CAPACITY_STRENGTHENING_COST')}
        comment-element="capacity-strengthening-costs"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="layout-horizontal row-padding-v extra-padd-top-no-bottom">
          <div class="w100">
            <label class="label">${translate(translatesMap.hq_support_cost)}</label>
          </div>
        </div>
        <div class="layout-horizontal">
          <div class="col col-4 space-betw">
            <sl-range
              dir="${this.dir}"
              .value="${this.data.hq_support_cost}"
              width="100%"
              max="7"
              step="0.1"
              ?disabled="${this.isReadonly(this.editMode, this.permissions?.edit.hq_support_cost)}"
              .editable="${!this.isReadonly(this.editMode, this.permissions?.edit.hq_support_cost)}"
              @sl-change="${(e: CustomEvent) => this.updateSlider(e)}"
            ></sl-range>
            <etools-input
              type="number"
              allowed-pattern="^\\d*\\.?\\d*$"
              .readonly="${!this.editMode}"
              .value="${this.data.hq_support_cost}"
              min="0"
              max="7"
              step="0.1"
              @value-changed="${({detail}: CustomEvent) => {
                this.valueChanged(detail, 'hq_support_cost', this.data);
                this.autoCalculatedHqContrib = this.autoCalcHqContrib();
              }}"
            ></etools-input>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v" ?hidden="${!this.isUnicefUser || !this.editMode}">
          <label class="label hq-info-label">
            ${translateUnsafeHTML('TOTAL_FOR_PERCENT_HQ', {
              PERCENT: `<b>${this.data.hq_support_cost}%</b>`,
              VALUE: `<b>${this.autoCalculatedHqContrib} ${this.data.planned_budget.currency}</b>`
            })}
          </label>
        </div>
        <div class="layout-horizontal">
          <etools-currency
            id="hqContrib"
            class="col-3"
            placeholder="&#8212;"
            required
            label=${translate(translatesMap.total_hq_cash_local)}
            .value="${this.data.planned_budget.total_hq_cash_local}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.planned_budget)}"
            tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.planned_budget) ? -1 : 0}"
            @value-changed="${({detail}: CustomEvent) => this.hqContribChanged(detail)}"
            .currency="${this.data.planned_budget?.currency}"
          >
          </etools-currency>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }
  @property({type: Object})
  data!: HqContributionData;

  @property({type: Object})
  permissions!: Permission<HqContributionPermissions>;

  @property({type: Object})
  originalData = {};

  @property({type: String})
  autoCalculatedHqContrib = '0';

  @property({type: String})
  dir = 'ltr';

  @property({type: Boolean})
  isUnicefUser = false;

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Workplan)) {
      return;
    }

    if (!state.interventions.current) {
      return;
    }

    this.isUnicefUser = get(state, 'user.data.is_unicef_user') as unknown as boolean;
    this.data = cloneDeep(selectHqContributionData(state));
    this.originalData = cloneDeep(this.data);
    this.autoCalculatedHqContrib = this.autoCalcHqContrib();
    this.setPermissions(state);
    this.dir = getPageDirection(state);
    super.stateChanged(state);
  }

  hqContribChanged(detail: any) {
    if (areEqual(this.data.planned_budget.total_hq_cash_local, detail.value)) {
      return;
    }

    this.data.planned_budget.total_hq_cash_local = detail.value;
    this.requestUpdate();
  }

  updateSlider(e: CustomEvent) {
    if (!e.target) {
      return;
    }
    this.data = {...this.data, hq_support_cost: (e.target as any).value} as HqContributionData;
    this.autoCalculatedHqContrib = this.autoCalcHqContrib();
  }

  autoCalcHqContrib() {
    const hqContrib =
      Number(this.data.planned_budget.total_unicef_cash_local_wo_hq) * (0.01 * Number(this.data.hq_support_cost));
    return this.limitDecimals(hqContrib);
  }

  limitDecimals(initVal: number) {
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

  private setPermissions(state: any) {
    this.permissions = selectHqContributionPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
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
  cleanUp(data: HqContributionData) {
    if (!data || !data.planned_budget) {
      return data;
    }
    data.planned_budget = {
      id: data.planned_budget.id,
      total_hq_cash_local: data.planned_budget.total_hq_cash_local
    };
    return data;
  }
}
