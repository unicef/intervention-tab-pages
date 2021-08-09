import {LitElement, customElement, html, property} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../etools-pages-common/styles/grid-layout-styles-lit';
import {elevationStyles} from '../../../../etools-pages-common/styles/elevation-styles';
import {BudgetSummary} from './budgetSummary.models';
import {selectBudgetSummary} from './budgetSummary.selectors';
import {pageIsNotCurrentlyActive} from '../../../../etools-pages-common/utils/common-methods';
import {RootState} from '../../common/types/store.types';
import get from 'lodash-es/get';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import {InfoElementStyles} from '../../../../etools-pages-common/styles/info-element-styles';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {FrsDetails, Intervention} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {TABS} from '../../common/constants';
import FrNumbersConsistencyMixin from '../../../../etools-pages-common/mixins/fr-numbers-consistency-mixin';
import {frWarningsStyles} from '../../../../etools-pages-common/styles/fr-warnings-styles';
import {customIcons} from '../../../../etools-pages-common/styles/custom-icons';

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
        class="elevation table not-allowed"
        elevation="1"
        comment-element="budget-summary"
        comment-description="Budget Summary"
      >
        <div class="data-column">
          <label class="paper-label">${translate('BUDGET_CURRENCY')}</label>
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
          <label class="paper-label">${translate('BUDGET_HQ_RATE')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.hq_support_cost)}">
            ${this.roundPercentage(this.budgetSummary.hq_support_cost)}(${this.displayCurrencyAmount(
              this.budgetSummary.total_hq_cash_local,
              '0.00'
            )})
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('PRGM_EFFECTIVENESS')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.programme_effectiveness)}">
            ${this.roundPercentage(this.budgetSummary.programme_effectiveness)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('TOTAL_UNICEF_CONTRIB')}</label>
          <div class="input-label" ?empty="${!this.budgetSummary.total_unicef_contribution_local}">
            ${this.displayCurrencyAmount(this.budgetSummary.total_unicef_contribution_local, '0.00')}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('TOTAL_UNICEF_CASH')}</label>
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
          <label class="paper-label">${translate('TOTAL_UNICEF_SUPPLY')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.in_kind_amount_local)}">
            ${this.displayCurrencyAmount(this.budgetSummary.in_kind_amount_local, '0.00')}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('TOTAL_CASH_AMT')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.total_cash_local)}">
            ${this.displayCurrencyAmount(this.budgetSummary.total_cash_local)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('TOTAL_AMT')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.total_local)}">
            ${this.displayCurrencyAmount(this.budgetSummary.total_local)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('TOTAL_PARTNER_SUPPLY')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.partner_supply_local)}">
            ${this.displayCurrencyAmount(this.budgetSummary.partner_supply_local)}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('TOTAL_PARTNER_CASH')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.partner_contribution_local)}">
            ${this.displayCurrencyAmount(this.budgetSummary.partner_contribution_local, '0.00')}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('TOTAL_PARTNER_CONTRIBUTION')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.total_partner_contribution_local)}">
            ${this.roundPercentage(this.budgetSummary.partner_contribution_percent)}
            (${this.displayCurrencyAmount(this.budgetSummary.total_partner_contribution_local)})
          </div>
        </div>

        <etools-info-tooltip icon="icons:info" position="left" id="not-allowed-icon">
          <span slot="message">
            <span>${translate('BUDGET_TOOLTIP')}</span>
          </span>
        </etools-info-tooltip>
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
      pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Workplan) ||
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
      'interventionMetadata',
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
