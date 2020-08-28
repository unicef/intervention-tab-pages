import {LitElement, customElement, html, property} from 'lit-element';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {elevationStyles} from '../../common/styles/elevation-styles';
import {BudgetSummary} from './budgetSummary.models';
import {selectBudgetSummary} from './budgetSummary.selectors';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import FrNumbersConsistencyMixin from '../../common/mixins/fr-numbers-consistency-mixin';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import {frWarningsStyles} from '../../common/styles/fr-warnings-styles';
import {Intervention, FrsDetails} from '../../common/models/intervention.types';
import {customIcons} from '../../common/styles/custom-icons';

/**
 * @customElement
 */
@customElement('budget-summary')
export class BudgetSummaryEl extends connect(getStore())(FrNumbersConsistencyMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, elevationStyles, frWarningsStyles];
  }
  render() {
    // language=HTML
    return html`
      ${customIcons}
      <style>
        ${sharedStyles} :host {
          display: block;
          margin-bottom: 24px;
        }
      </style>
      <section class="elevation content-wrapper" elevation="1">
        <div class="layout-horizontal">
          <div class="col col-1">
            <span>
              <label class="paper-label">Budget Currency</label>
            </span>
          </div>
          <div class="col col-1">
            <span>
              <label class="paper-label">Budget HQ Rate</label>
            </span>
          </div>
          <div class="col col-2">
            <span>
              <label class="paper-label">% Prgm Effectiveness</label>
            </span>
          </div>
          <div class="col col-1">
            <span>
              <label class="paper-label">Total CSO Contrib</label>
            </span>
          </div>
          <div class="col col-2">
            <span>
              <label class="paper-label">Total Unicef Contrib</label>
            </span>
          </div>
          <div class="col col-1">
            <span>
              <label class="paper-label">Total Supply</label>
            </span>
          </div>
          <div class="col col-1">
            <span>
              <label class="paper-label">% Partner Contrib</label>
            </span>
          </div>
          <div class="col col-1">
            <span>
              <label class="paper-label">Total Cash Amt</label>
            </span>
          </div>
          <div class="col col-2">
            <span>
              <label class="paper-label">Total Amt (Cash + Supply)</label>
            </span>
          </div>
        </div>
        <div class="layout-horizontal">
          <div class="col col-1">
            <etools-info-tooltip
              class="fr-nr-warn currency-mismatch"
              icon-first
              custom-icon
              ?hide-tooltip="${this.allCurrenciesMatch(
                this.frsDetails.currencies_match,
                this.frsDetails.frs,
                this.budgetSummary.currency
              )}"
            >
              <label class="input-label" ?empty="${!this.budgetSummary.currency}">
                ${this.budgetSummary.currency}
              </label>
              <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
              <span slot="message">${this.getFrCurrencyTooltipMsg()}</span>
            </etools-info-tooltip>
            <span>
              <label class="input-label" ?empty="${!this.budgetSummary.currency}">
                ${this.budgetSummary.currency}
              </label>
            </span>
          </div>
          <div class="col col-1">
            <span>
              <label class="input-label" ?empty="${!this.budgetSummary.hq_support_cost}">
                ${this.budgetSummary.hq_support_cost}
              </label>
            </span>
          </div>
          <div class="col col-2">
            <span>
              <label class="input-label" ?empty="${!this.budgetSummary.prgm_effectiveness}">
                ${this.budgetSummary.prgm_effectiveness}
              </label>
            </span>
          </div>
          <div class="col col-1">
            <span>
              <label class="input-label" ?empty="${!this.budgetSummary.partner_contribution_local}">
                ${this.displayCurrencyAmount(this.budgetSummary.partner_contribution_local, '0.00')}
              </label>
            </span>
          </div>
          <div class="col col-2">
            <etools-info-tooltip
              class="fr-nr-warn"
              icon-first
              custom-icon
              ?hide-tooltip="${!this.frsConsistencyWarningIsActive(this._frsConsistencyWarning)}"
            >
              <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
              <span slot="message">${this._frsConsistencyWarning}</span>
            </etools-info-tooltip>
            <span>
              <label class="input-label" ?empty="${!this.budgetSummary.unicef_cash_local}">
                ${this.displayCurrencyAmount(this.budgetSummary.unicef_cash_local, '0.00')}
              </label>
            <span>
          </div>
          <div class="col col-1">
            <span>
              <label class="input-label" ?empty="${this.budgetSummary.total_supply}">
                ${this.displayCurrencyAmount(this.budgetSummary.total_supply, '0.00')}
              </label>
            </span>
          </div>
          <div class="col col-1">
            <span>
              <label class="input-label" ?empty="${!this.budgetSummary.partner_percentage}">
                ${this.budgetSummary.partner_percentage}
              </label>
            </span>
          </div>
          <div class="col col-1">
            <span>
              <label class="input-label" ?empty="${!this.budgetSummary.total_cash}">
                ${this.budgetSummary.total_cash}
              </label>
            </span>
          </div>
          <div class="col col-2">
            <span>
              <label class="input-label" ?empty="${!this.budgetSummary.in_kind_amount}">
                ${this.budgetSummary.in_kind_amount}
              </label>
            </span>
          </div>
        </div>
      </section>
    `;
  }

  @property({type: Object})
  budgetSummary!: BudgetSummary;

  @property({type: Object})
  intervention!: Intervention;

  @property({type: String})
  _frsConsistencyWarning = '';

  @property({type: Object})
  frsDetails!: FrsDetails;

  connectedCallback() {
    super.connectedCallback();
  }

  public stateChanged(state: any) {
    if (!state.interventions.current) {
      return;
    }
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'results')) {
      return;
    }
    this.budgetSummary = selectBudgetSummary(state);
    this.intervention = state.interventions.current;
    this.frsDetails = this.intervention.frs_details;
    const warn = this.checkFrsAndUnicefCashAmountsConsistency(
      this.budgetSummary.unicef_cash_local!,
      this.frsDetails.total_frs_amt,
      this.intervention,
      'interventionDetails',
      true
    );
    this._frsConsistencyWarning = String(warn);
  }
}
