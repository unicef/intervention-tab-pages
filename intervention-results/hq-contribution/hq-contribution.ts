import {LitElement, html, customElement, property} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';
import '@polymer/paper-slider/paper-slider.js';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {selectHqContributionData, selectHqContributionPermissions} from './hqContribution.selectors';
import {HqContributionData, HqContributionPermissions} from './hqContribution.models';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {getStore} from '../../utils/redux-store-access';
import {patchIntervention} from '../../common/actions/interventions';
import cloneDeep from 'lodash-es/cloneDeep';
import {RootState} from '../../common/types/store.types';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import {areEqual, decimalFractionEquals0} from '../../utils/utils';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, Permission} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

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
        .extra-padd-top-no-bottom {
          padding-top: 16px !important;
          padding-bottom: 0 !important;
        }
        paper-slider {
          width: 100%;
          margin-left: -15px;
          margin-top: -5px;
          height: 30px;
        }
        .hq-info-label {
          color: darkred;
          padding-bottom: 5px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('HEADQUARTERS_CONTRIBUTION_TITLE')}
        comment-element="hq-contribution"
        comment-description=${translate('HEADQUARTERS_CONTRIBUTION_TITLE')}
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="layout-horizontal row-padding-v extra-padd-top-no-bottom">
          <div class="w100">
            <label class="paper-label">${translate('HEADQUARTERS_CONTRIBUTION')}</label>
          </div>
        </div>
        <div class="layout-horizontal">
          <div class="col col-4">
            <paper-slider
              dir="${this.dir}"
              .value="${this.data.hq_support_cost}"
              width="100%"
              max="7"
              step="0.1"
              ?disabled="${this.isReadonly(this.editMode, this.permissions.edit.hq_support_cost)}"
              .editable="${!this.isReadonly(this.editMode, this.permissions.edit.hq_support_cost)}"
              @value-changed="${(e: CustomEvent) => this.updateSlider(e)}"
            ></paper-slider>
            <span ?hidden="${this.editMode}">${this.data.hq_support_cost}</span>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v" ?hidden="${!this.isUnicefUser}">
          <label class="paper-label hq-info-label"
            ><b>${this.data.hq_support_cost}%</b> of the total UNICEF cash contribution is:
            <b>${this.autoCalculatedHqContrib} ${this.data.planned_budget.currency}</b>. Please review and enter the
            actual final number below.</label
          >
        </div>
        <div class="layout-horizontal">
          <etools-currency-amount-input
            id="hqContrib"
            class="col-3"
            placeholder="&#8212;"
            label=${translate('HQ_CONTRIBUTION')}
            .value="${this.data.planned_budget.total_hq_cash_local}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.planned_budget)}"
            @value-changed="${({detail}: CustomEvent) => this.hqContribChanged(detail)}"
          >
          </etools-currency-amount-input>
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
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'results')) {
      return;
    }

    if (!state.interventions.current) {
      return;
    }

    this.isUnicefUser = get(state, 'user.data.is_unicef_user');
    this.data = selectHqContributionData(state);
    this.originalData = cloneDeep(this.data);
    this.autoCalculatedHqContrib = this.autoCalcHqContrib();
    this.setPermissions(state);
    this.dir = this.getPageDirection(state);
    super.stateChanged(state);
  }

  getPageDirection(state: RootState) {
    if (get(state, 'activeLanguage.activeLanguage') === 'ar') {
      return 'rtl';
    }
    return 'ltr';
  }

  hqContribChanged(detail: any) {
    if (areEqual(this.data.planned_budget.total_hq_cash_local, detail.value)) {
      return;
    }

    this.data.planned_budget.total_hq_cash_local = detail.value;
    this.requestUpdate();
  }

  updateSlider(e: CustomEvent) {
    if (!e.detail) {
      return;
    }
    this.data = {...this.data, hq_support_cost: e.detail.value} as HqContributionData;
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
