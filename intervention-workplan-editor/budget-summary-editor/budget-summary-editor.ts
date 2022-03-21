import {css, customElement, html, TemplateResult} from 'lit-element';
import {BudgetSummaryEl} from '../../intervention-workplan/budget-summary/budget-summary';
import {InfoElementStyles} from '@unicef-polymer/etools-modules-common/dist/styles/info-element-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {customIcons} from '@unicef-polymer/etools-modules-common/dist/styles/custom-icons';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {translate} from 'lit-translate';

@customElement('budget-summary-editor')
export class BudgetSummaryEditor extends BudgetSummaryEl {
  render(): TemplateResult {
    return html`${customIcons}${sharedStyles}${InfoElementStyles}
      <div class="tooltip">${this.getIconTooltip()}</div>
      <div class="information-cells">
        ${this.getTable()}
        <div class="amt-data">
          <label class="paper-label">${translate('TOTAL_AMT')}</label>
          <div class="input-label" ?empty="${this.isEmpty(this.budgetSummary.total_local)}">
            <span>${this.budgetSummary.currency}</span> ${displayCurrencyAmount(String(this.budgetSummary.total_local))}
          </div>
        </div>
      </div> `;
  }

  static get styles() {
    // language=css
    return [
      ...BudgetSummaryEl.styles,
      css`
        :host {
          margin-bottom: 0;
          margin-top: 30px;
          padding-left: 40px;
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
}
