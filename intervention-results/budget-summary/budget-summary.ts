import {LitElement, customElement, html, property} from 'lit-element';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {elevationStyles} from '../../common/styles/elevation-styles';
import {BudgetSummary} from './budgetSummary.models';
import {selectBudgetSummary} from './budgetSummary.selectors';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import {RootState} from '../../common/types/store.types';
import get from 'lodash-es/get';
import FrNumbersConsistencyMixin from '../../common/mixins/fr-numbers-consistency-mixin';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import {frWarningsStyles} from '../../common/styles/fr-warnings-styles';
import {customIcons} from '../../common/styles/custom-icons';
import {InfoElementStyles} from '../../common/styles/info-element-styles';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {FrsDetails, Intervention} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

/**
 * @customElement
 */
@customElement('budget-summary')
export class BudgetSummaryEl extends CommentsMixin(FrNumbersConsistencyMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, elevationStyles, frWarningsStyles];
  }
  render() {
    if (!this.budgetSummary) {
      return html`<style>
          ${customIcons} ${InfoElementStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${customIcons} ${InfoElementStyles}
      <section
        class="elevation table"
        elevation="1"
        comment-element="budget-summary"
        comment-description="Budget Summary"
      >
        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_RESULTS.BUDGET_CURRENCY')}</label>
          <div>
            <etools-info-tooltip
              class="fr-nr-warn currency-mismatch"
              icon-first
              custom-icon
              ?hide-tooltip="${this.getTooltip}"
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
          <label class="paper-label">${translate('INTERVENTION_RESULTS.BUDGET_HQ_RATE')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.hq_support_cost)}">
            ${this.roundPercentage(this.budgetSummary.hq_support_cost)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_RESULTS.PRGM_EFFECTIVENESS')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.programme_effectiveness)}">
            ${this.roundPercentage(this.budgetSummary.programme_effectiveness)}
          </div>
        </div>
        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_RESULTS.TOTAL_CSO_CONTRIB')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.partner_contribution_local)}">
            ${this.displayCurrencyAmount(this.budgetSummary.partner_contribution_local, '0.00')}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_RESULTS.TOTAL_UNICEF_CONTRIB')}</label>
          <div class="input-label" ?empty="${!this.budgetSummary.total_unicef_contribution_local}">
            ${this.displayCurrencyAmount(this.budgetSummary.total_unicef_contribution_local, '0.00')}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_RESULTS.TOTAL_UNICEF_CASH')}</label>
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
          <label class="paper-label">${translate('INTERVENTION_RESULTS.TOTAL_SUPPLY')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.in_kind_amount_local)}">
            ${this.displayCurrencyAmount(this.budgetSummary.in_kind_amount_local, '0.00')}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_RESULTS.PARTNER_CONTRIB')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.partner_contribution_percent)}">
            ${this.roundPercentage(this.budgetSummary.partner_contribution_percent)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_RESULTS.TOTAL_CASH_AMT')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.total_cash_local)}">
            ${this.displayCurrencyAmount(this.budgetSummary.total_cash_local)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('INTERVENTION_RESULTS.TOTAL_AMT')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.total_local)}">
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
    super.stateChanged(state);
  }

  roundPercentage(percentage: string | number) {
    return Math.round(Number(percentage) * 100) / 100 + '%';
  }

  isEmpty(value: any): boolean {
    return !value && value !== 0;
  }

  getTooltip() {
    if (this.budgetSummary.currency) {
      // meaning we do not have currency set, so no need to show tooltip at this moment
      return true;
    }
    return this.allCurrenciesMatch(this.frsDetails.currencies_match, this.frsDetails.frs, this.budgetSummary.currency);
  }
}
