import {LitElement, html, TemplateResult, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {BudgetSummary} from './budgetSummary.models';
import {selectBudgetSummary} from './budgetSummary.selectors';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {RootState} from '../types/store.types';
import get from 'lodash-es/get';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import {InfoElementStyles} from '@unicef-polymer/etools-modules-common/dist/styles/info-element-styles';
import {CommentsMixin} from '../components/comments/comments-mixin';
import {FrsDetails, Intervention} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {TABS} from '../constants';
import {isUnicefUser} from '../selectors';
import FrNumbersConsistencyMixin from '@unicef-polymer/etools-modules-common/dist/mixins/fr-numbers-consistency-mixin';
import {frWarningsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/fr-warnings-styles';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/info-icon-tooltip';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';
import {getPageDirection} from '../../utils/utils';

/**
 * @customElement
 */
@customElement('budget-summary')
export class BudgetSummaryEl extends CommentsMixin(FrNumbersConsistencyMixin(LitElement)) {
  static get styles() {
    return [
      layoutStyles,
      elevationStyles,
      frWarningsStyles,
      css`
        section {
          display: block !important;
          padding-top: 0;
          padding-inline: 40px 15px;
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
          margin-inline-start: 30px;
        }
        .mt-6 {
          margin-block-start: -6px;
        }
        .amt-data .label {
          font-weight: 400;
          font-size: var(--etools-font-size-14, 14px);
          line-height: 16px;
          white-space: nowrap;
        }
        .amt-data .input-label {
          align-items: flex-end;
          font-size: var(--etools-font-size-24, 24px);
          font-weight: 900;
          line-height: 28px;
        }
        .amt-data .input-label span {
          font-size: var(--etools-font-size-16, 16px);
          font-weight: 400;
          line-height: 25px;
          margin-inline-end: 6px;
        }
        @media (max-width: 768px) {
          section {
            padding-inline: 15px 15px;
          }
          .information-cells {
            flex-direction: column-reverse;
          }
          .amt-data {
            margin-inline-start: 4px;
          }
          .amt-data .input-label span {
            font-size: var(--etools-font-size-12, 12px);
            line-height: 20px;
            margin-inline-end: 2px;
          }
          .amt-data .input-label {
            font-size: var(--etools-font-size-18, 18px);
            line-height: 24px;
          }
          .icon-wrapper {
            flex-wrap: nowrap;
            padding-top: 0 !important;
          }
        }
      `
    ];
  }
  render() {
    if (!this.budgetSummary) {
      return html`<style>
          ${sharedStyles} ${InfoElementStyles}
        </style>
        <etools-loading source="b-s" active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles} ${InfoElementStyles}
      <section class="elevation layout-horizontal" elevation="1" comment-element="budget-summary">
        <div class="tooltip">${this.getIconTooltip()}</div>
        <div class="information-cells">
          ${this.getTable()}
          <div class="amt-data">
            <label class="label">${translate('TOTAL_AMT')}</label>
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
          <label class="label">${translate('BUDGET_CURRENCY')}</label>
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
              <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
              <span slot="message">${this.getFrsCurrencyTooltipMsg(this.frsDetails.currencies_match)}</span>
            </etools-info-tooltip>
            <div class="input-label" ?empty="${!this.budgetSummary.currency}">${this.budgetSummary.currency}</div>
          </div>
        </div>

        <div class="data-column">
          <label class="label">${translate('CAPACITY_STRENGTHENING_COST_RATE')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.hq_support_cost)}">
            ${this.roundPercentage(this.budgetSummary.hq_support_cost)}(${displayCurrencyAmount(
              String(this.budgetSummary.total_hq_cash_local),
              '0.00'
            )})
          </div>
        </div>

        <div class="data-column">
          <div class="icon-wrapper mt-6">
            <label class="label">${translate('PRGM_EFFECTIVENESS')}</label>
            <info-icon-tooltip .tooltipText="${translate('PRGM_EFFECTIVENESS_TOOLTIP')}"></info-icon-tooltip>
          </div>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.programme_effectiveness)}">
            ${this.roundPercentage(this.budgetSummary.programme_effectiveness)}
          </div>
        </div>

        <div class="data-column">
          <label class="label">${translate('TOTAL_UNICEF_CONTRIB')}</label>
          <div class="input-label" ?empty="${!this.budgetSummary.total_unicef_contribution_local}">
            ${displayCurrencyAmount(String(this.budgetSummary.total_unicef_contribution_local), '0.00')}
          </div>
        </div>

        <div class="data-column">
          <label class="label">${translate('TOTAL_UNICEF_CASH')}</label>
          <div>
            <etools-info-tooltip
              class="fr-nr-warn"
              icon-first
              custom-icon
              ?hide-tooltip="${!this.frsConsistencyWarningIsActive(this._frsConsistencyWarning)}"
            >
              <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
              <span slot="message">${this._frsConsistencyWarning}</span>
            </etools-info-tooltip>
            <div class="input-label" ?empty="${!this.budgetSummary.unicef_cash_local}">
              ${displayCurrencyAmount(String(this.budgetSummary.unicef_cash_local), '0.00')}
            </div>
          </div>
        </div>

        <div class="data-column">
          <label class="label">${translate('TOTAL_UNICEF_SUPPLY')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.in_kind_amount_local)}">
            ${displayCurrencyAmount(String(this.budgetSummary.in_kind_amount_local), '0.00')}
          </div>
        </div>

        <div class="data-column">
          <label class="label">${translate('TOTAL_CASH_AMT')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.total_cash_local)}">
            ${displayCurrencyAmount(String(this.budgetSummary.total_cash_local))}
          </div>
        </div>

        <div class="data-column amt-column">
          <label class="label">${translate('TOTAL_AMT')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.total_local)}">
            ${displayCurrencyAmount(String(this.budgetSummary.total_local))}
          </div>
        </div>

        <div class="data-column">
          <label class="label">${translate('TOTAL_PARTNER_SUPPLY')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.partner_supply_local)}">
            ${displayCurrencyAmount(String(this.budgetSummary.partner_supply_local))}
          </div>
        </div>

        <div class="data-column">
          <label class="label">${translate('TOTAL_PARTNER_CASH')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.partner_contribution_local)}">
            ${displayCurrencyAmount(String(this.budgetSummary.partner_contribution_local), '0.00')}
          </div>
        </div>

        <div class="data-column">
          <label class="label">${translate('TOTAL_PARTNER_CONTRIBUTION')}</label>
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
      <info-icon-tooltip
        .tooltipText="${translate('BUDGET_TOOLTIP')}"
        position="${this.dir == 'rtl' ? 'right' : 'left'}"
      >
      </info-icon-tooltip>
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
      (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Workplan) &&
        EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.WorkplanEditor)) ||
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
    this.dir = getPageDirection(state);
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
