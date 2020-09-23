import {LitElement, customElement, html, property} from 'lit-element';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {elevationStyles} from '../../common/styles/elevation-styles';
import {BudgetSummary} from './budgetSummary.models';
import {selectBudgetSummary} from './budgetSummary.selectors';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import {RootState} from '../../common/models/globals.types';
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
        section.table {
          display: flex;
          position: relative;
          justify-content: flex-start;
          padding: 0px 24px;
          flex-wrap: wrap;
        }
        .data-column {
          margin: 14px 0;
          min-width: 150px;
          max-width: max-content;
          padding: 0 5px;
          box-sizing: border-box;
        }
        .data-column > div {
          display: flex;
          padding-top: 4px;
        }
        .input-label {
          padding-top: 0;
          display: flex;
          align-items: center;
        }
      </style>
      <section class="elevation table" elevation="1">
        <div class="data-column">
          <label class="paper-label">Budget Currency</label>
          <div>
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
              <span slot="message">${this.getFrsCurrencyTooltipMsg(this.frsDetails.currencies_match)}</span>
            </etools-info-tooltip>
            <div class="input-label" ?empty="${!this.budgetSummary.currency}">${this.budgetSummary.currency}</div>
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">Budget HQ Rate</label>
          <div class="input-label" ?empty="${!this.budgetSummary.hq_support_cost}">
            ${this.roundPercentage(this.budgetSummary.hq_support_cost)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">% Prgm Effectiveness</label>
          <div class="input-label" ?empty="${!this.budgetSummary.programme_effectiveness}">
            ${this.roundPercentage(this.budgetSummary.programme_effectiveness)}
          </div>
        </div>
        <div class="data-column">
          <label class="paper-label">Total CSO Contrib</label>
          <div class="input-label" ?empty="${!this.budgetSummary.partner_contribution_local}">
            ${this.displayCurrencyAmount(this.budgetSummary.partner_contribution_local, '0.00')}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">Total Unicef Contrib</label>
          <div>
            <etools-info-tooltip
              class="fr-nr-warn"
              icon-first
              custom-icon
              ?hide-tooltip="${!this.frsConsistencyWarningIsActive(this._frsConsistencyWarning)}"
            >
              <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
              <span slot="message">${this._frsConsistencyWarning}</span>
            </etools-info-tooltip>
            <div class="input-label" ?empty="${!this.budgetSummary.unicef_cash_local}">
              ${this.displayCurrencyAmount(this.budgetSummary.unicef_cash_local, '0.00')}
            </div>
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">Total Supply</label>
          <div class="input-label" ?empty="${!this.budgetSummary.in_kind_amount_local}">
            ${this.displayCurrencyAmount(this.budgetSummary.in_kind_amount_local, '0.00')}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">% Partner Contrib</label>
          <div class="input-label" ?empty="${!this.budgetSummary.partner_contribution_percent}">
            ${this.roundPercentage(this.budgetSummary.partner_contribution_percent)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">Total Cash Amt</label>
          <div class="input-label" ?empty="${!this.budgetSummary.unicef_cash_local}">
            ${this.displayCurrencyAmount(this.budgetSummary.unicef_cash_local)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">Total Amt (Cash + Supply)</label>
          <div class="input-label" ?empty="${!this.budgetSummary.total_local}">
            ${this.displayCurrencyAmount(this.budgetSummary.total_local)}
          </div>
        </div>
      </section>
    `;
  }

  intervention!: Intervention;

  @property({type: Object})
  budgetSummary!: BudgetSummary;

  @property({type: String})
  _frsConsistencyWarning = '';

  @property({type: Object})
  frsDetails!: FrsDetails;

  connectedCallback() {
    super.connectedCallback();
  }

  public stateChanged(state: RootState) {
    if (
      pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'results') ||
      !state.interventions.current
    ) {
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

  roundPercentage(percentage: string | number) {
    return Math.round(Number(percentage) * 100) / 100 + '%';
  }
}
