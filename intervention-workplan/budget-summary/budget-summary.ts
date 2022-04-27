import {LitElement, customElement, html, property, TemplateResult, css} from 'lit-element';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {BudgetSummary} from './budgetSummary.models';
import {selectBudgetSummary} from './budgetSummary.selectors';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {RootState} from '../../common/types/store.types';
import get from 'lodash-es/get';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import {InfoElementStyles} from '@unicef-polymer/etools-modules-common/dist/styles/info-element-styles';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {FrsDetails, Intervention} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {TABS} from '../../common/constants';
import {isUnicefUser} from '../../common/selectors';
import FrNumbersConsistencyMixin from '@unicef-polymer/etools-modules-common/dist/mixins/fr-numbers-consistency-mixin';
import {frWarningsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/fr-warnings-styles';
import {customIcons} from '@unicef-polymer/etools-modules-common/dist/styles/custom-icons';
import '@unicef-polymer/etools-info-tooltip/info-icon-tooltip';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';

/**
 * @customElement
 */
@customElement('budget-summary')
export class BudgetSummaryEl extends CommentsMixin(FrNumbersConsistencyMixin(LitElement)) {
  static get styles() {
    return [
      gridLayoutStylesLit,
      elevationStyles,
      frWarningsStyles,
      css`
        section {
          display: block !important;
          padding: 5px 15px 0 40px;
          margin-bottom: 0;
        }
        :host([embeded]) section {
          box-shadow: none;
        }
        .table {
          padding: 0;
        }
        .tooltip {
          display: flex;
          justify-content: flex-end;
        }
        .amt-column {
          display: none;
        }
        .information-cells {
          display: flex;
          margin-top: -9px;
        }
        .amt-data {
          margin-top: 14px;
          margin-left: 30px;
        }
        .amt-data .paper-label {
          font-weight: 400;
          font-size: 14px;
          line-height: 16px;
          white-space: nowrap;
        }
        .amt-data .input-label {
          align-items: flex-end;
          font-size: 24px;
          font-weight: 900;
          line-height: 28px;
        }
        .amt-data .input-label span {
          font-size: 16px;
          font-weight: 400;
          line-height: 25px;
          margin-right: 6px;
        }
      `
    ];
  }
  render() {
    if (!this.budgetSummary) {
      return html`<style>
          ${customIcons} ${sharedStyles} ${InfoElementStyles}
        </style>
        <etools-loading source="b-s" loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${customIcons}${sharedStyles} ${InfoElementStyles}
      <section
        class="elevation layout-horizontal"
        elevation="1"
        comment-element="budget-summary"
        comment-description="Budget Summary"
      >
        <div class="tooltip">${this.getIconTooltip()}</div>
        <div class="information-cells">
          ${this.getTable()}
          <div class="amt-data">
            <label class="paper-label">${translate('TOTAL_AMT')}</label>
            <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.total_local)}">
              <span>${this.budgetSummary.currency}</span> ${displayCurrencyAmount(
                String(this.budgetSummary.total_local)
              )}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  getTable(): TemplateResult {
    return html`
      <div class="table not-allowed">
        <div class="data-column">
          <label class="paper-label">${translate('BUDGET_CURRENCY')}</label>
          <div>
            <etools-info-tooltip
              class="fr-nr-warn currency-mismatch"
              icon-first
              custom-icon
              ?hide-tooltip="${this.currenciesMatch()}"
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
            ${this.roundPercentage(this.budgetSummary.hq_support_cost)}(${displayCurrencyAmount(
              String(this.budgetSummary.total_hq_cash_local),
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
            ${displayCurrencyAmount(String(this.budgetSummary.total_unicef_contribution_local), '0.00')}
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
              ${displayCurrencyAmount(String(this.budgetSummary.unicef_cash_local), '0.00')}
            </div>
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('TOTAL_UNICEF_SUPPLY')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.in_kind_amount_local)}">
            ${displayCurrencyAmount(String(this.budgetSummary.in_kind_amount_local), '0.00')}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('TOTAL_CASH_AMT')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.total_cash_local)}">
            ${displayCurrencyAmount(String(this.budgetSummary.total_cash_local))}
          </div>
        </div>

        <div class="data-column amt-column">
          <label class="paper-label">${translate('TOTAL_AMT')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.total_local)}">
            ${displayCurrencyAmount(String(this.budgetSummary.total_local))}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('TOTAL_PARTNER_SUPPLY')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.partner_supply_local)}">
            ${displayCurrencyAmount(String(this.budgetSummary.partner_supply_local))}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('TOTAL_PARTNER_CASH')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.partner_contribution_local)}">
            ${displayCurrencyAmount(String(this.budgetSummary.partner_contribution_local), '0.00')}
          </div>
        </div>

        <div class="data-column">
          <label class="paper-label">${translate('TOTAL_PARTNER_CONTRIBUTION')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.total_partner_contribution_local)}">
            ${this.roundPercentage(this.budgetSummary.partner_contribution_percent)}
            (${displayCurrencyAmount(String(this.budgetSummary.total_partner_contribution_local))})
          </div>
        </div>
      </div>
    `;
  }

  getIconTooltip(): TemplateResult {
    return html`<div class="icon-tooltip-div">
      <info-icon-tooltip .tooltipText="${translate('BUDGET_TOOLTIP')}" position="left"> </info-icon-tooltip>
    </div>`;
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
      (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Workplan) &&
        pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.WorkplanEditor)) ||
      !state.interventions.current
    ) {
      return;
    }
    this.budgetSummary = selectBudgetSummary(state);
    this.intervention = state.interventions.current;
    this.frsDetails = this.intervention.frs_details;
    if (isUnicefUser(state)) {
      this.setFrsConsistencyWarning();
    }
    super.stateChanged(state);
  }

  setFrsConsistencyWarning(): void {
    const warn = this.checkFrsAndUnicefCashAmountsConsistency(
      this.budgetSummary.unicef_cash_local!,
      this.frsDetails.total_frs_amt,
      this.intervention,
      'interventionMetadata',
      true
    );
    this._frsConsistencyWarning = String(warn);
  }

  roundPercentage(percentage: string | number) {
    return Math.round(Number(percentage) * 100) / 100 + '%';
  }

  isEmpty(value: any): boolean {
    return !value && value !== 0;
  }

  currenciesMatch() {
    if (!this.frsDetails.frs.length) {
      // if no FR number added, hide currency-mismatch tooltip
      return true;
    }
    return this.allCurrenciesMatch(this.frsDetails.currencies_match, this.frsDetails.frs, this.budgetSummary.currency);
  }
}
