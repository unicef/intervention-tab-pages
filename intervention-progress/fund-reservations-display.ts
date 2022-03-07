import {LitElement, customElement, html, property} from 'lit-element';
import '@polymer/iron-label/iron-label';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/iron-icons/iron-icons';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import isEmpty from 'lodash-es/isEmpty';
import {AnyObject} from '@unicef-polymer/etools-types';
import {Intervention, FrsDetails} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {frWarningsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/fr-warnings-styles';
import FrNumbersConsistencyMixin from '@unicef-polymer/etools-modules-common/dist/mixins/fr-numbers-consistency-mixin';
import {customIcons} from '@unicef-polymer/etools-modules-common/dist/styles/custom-icons';
import {prettyDate} from '@unicef-polymer/etools-modules-common/dist/utils/date-utils';

/**
 * @customElement
 */
@customElement('fund-reservations-display')
export class FundReservationsDisplay extends FrNumbersConsistencyMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, frWarningsStyles];
  }
  render() {
    if (!this.frsDetails || !this.intervention) {
      return html`<etools-loading source="fund-res-display" loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      ${customIcons} ${sharedStyles}
      <style>
        :host {
          --list-column-label: {
            margin-right: 0;
          }
        }
        #totalsRow {
          --list-row-no-collapse: {
            background-color: var(--light-theme-background-color);
          }
          --list-bg-color: var(--light-theme-background-color);
        }
        #plannedUnicefCash,
        #totalsRow {
          --list-row-wrapper-padding: 0 24px 0 56px;
        }
        #plannedUnicefCash {
          --list-bg-color: none;
        }
        #plannedUnicefCash .unicef-cash-col {
          background-color: var(--light-info-color);
          margin-top: -12px;
          margin-bottom: -12px;
          padding-top: 12px;
          padding-bottom: 12px;
          line-height: 16px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .unicef-cash-col iron-label {
          font-size: 12px;
          color: var(--secondary-text-color);
          font-weight: bold;
        }
        div[simple-header] > span,
        div[simple-row] > span {
          padding-right: 24px;
        }
        div[simple-header] {
          color: var(--list-secondary-text-color, #757575);
        }
        .pl-5 {
          padding-left: 5px;
        }
      </style>

      <div class="row-h" ?hidden="${this.frsDetails.frs.length}">
        <p>${translate('NO_FUND_RESERVATIONS')}</p>
      </div>

      <div class="list-container" ?hidden="${this._noFrs(this.frsDetails)}">
        <etools-data-table-header id="listHeader" no-title ?hidden="${!this.frsDetails || !this.frsDetails.frs.length}">
          <etools-data-table-column class="col-2"> FR# </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align"> FR Posting Date </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align"> FR Currency </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align"> FR Amount </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align"> Actual Disburs. </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align"> Outstanding DCT </etools-data-table-column>
        </etools-data-table-header>

        ${this.frsDetails.frs.map(
          (fr: AnyObject) => html`
            <etools-data-table-row>
              <div slot="row-data" class="layout-horizontal">
                <span class="col-data col-2"
                  >${fr.fr_number}
                  <a title="See more details" class="pl-5" target="_blank" href="${this.getFRNumberLink(fr.fr_number)}">
                    <iron-icon class="lifted-up-icon" icon="pmp-custom-icons:external-icon"></iron-icon>
                  </a>
                </span>
                <span class="col-data col-2 right-align">${prettyDate(fr.start_date)}</span>
                <span class="col-data col-2 right-align">
                  <etools-info-tooltip
                    class="fr-nr-warn currency-mismatch"
                    icon-first
                    custom-icon
                    .hideTooltip="${this.hideFrCurrencyTooltip(
                      this.frsDetails!.currencies_match,
                      fr.currency,
                      this.intervention!.planned_budget.currency
                    )}"
                  >
                    <span slot="field">${fr.currency}</span>
                    <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                    <span slot="message">
                      <span>${this.getFrCurrencyTooltipMsg()}</span>
                    </span>
                  </etools-info-tooltip>
                </span>
                <span class="col-data col-2 right-align">${displayCurrencyAmount(fr.total_amt_local, '0.00')}</span>
                <span class="col-data col-2 right-align">
                  <etools-info-tooltip
                    class="fr-nr-warn currency-mismatch"
                    icon-first
                    custom-icon
                    .hideTooltip="${!this.frsConsistencyWarningIsActive(fr.multi_curr_flag)}"
                  >
                    <span slot="field" class="${this.getFrsValueNAClass(fr.multi_curr_flag, true)}">
                      ${this.getFrsTotal(fr.multi_curr_flag, fr.actual_amt_local, true)}
                    </span>
                    <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                    <span slot="message">
                      <span>${this.getFrsMultiCurrFlagErrTooltipMsg()}</span>
                    </span>
                  </etools-info-tooltip>
                </span>
                <span class="col-data col-2 right-align"
                  >${displayCurrencyAmount(fr.outstanding_amt_local, '0.00')}</span
                >
              </div>
              <div slot="row-data-details">
                <div class="flex-c" ?hidden="${isEmpty(fr.line_item_details)}">
                  <div simple-header class="layout-horizontal">
                    <span class="col-2">FR Line Item</span>
                    <span class="col-2">Donor</span>
                    <span class="col-2">Grant</span>
                  </div>
                  ${fr.line_item_details.map(
                    (frInfo: AnyObject) => html`
                      <div simple-row class="layout-horizontal">
                        <span class="col-2">
                          <span>${fr.fr_number - frInfo.line_item}</span>
                        </span>
                        <span class="col-2 ${this._getOtherStyleIfNA(frInfo.donor)}">
                          <span>${this.getValueOrNA(frInfo.donor)}</span>
                        </span>
                        <span class="col-2 ${this._getOtherStyleIfNA(frInfo.grant_number)}">
                          <span>${this.getValueOrNA(frInfo.grant_number)}</span>
                        </span>
                      </div>
                    `
                  )}
                </div>
                <div class="flex-c" ?hidden="${!isEmpty(fr.line_item_details)}">There are no details to display.</div>
              </div>
            </etools-data-table-row>
          `
        )}

        <etools-data-table-row no-collapse id="totalsRow">
          <div slot="row-data" class="layout-horizontal">
            <span class="col-data col-2"></span>
            <span class="col-data col-2 right-align"><strong>TOTAL of FRs</strong></span>
            <span class="col-data col-2 right-align">
              <etools-info-tooltip
                class="fr-nr-warn currency-mismatch"
                icon-first
                custom-icon
                .hideTooltip="${this.allCurrenciesMatch(
                  this.frsDetails.currencies_match,
                  this.frsDetails.frs,
                  this.intervention.planned_budget.currency!
                )}"
              >
                <span slot="field" class="${this.getFrsValueNAClass(this.frsDetails.currencies_match)}">
                  ${this.getFrsCurrency(this.frsDetails.currencies_match, this.frsDetails.frs)}
                </span>
                <iron-icon
                  icon="${this.getFrsCurrencyTooltipIcon(this.frsDetails.currencies_match)}"
                  slot="custom-icon"
                ></iron-icon>
                <span slot="message">${this.getFrsCurrencyTooltipMsg(this.frsDetails.currencies_match)}</span>
              </etools-info-tooltip>
            </span>
            <span class="col-data col-2 right-align">
              <etools-info-tooltip
                class="fr-nr-warn"
                custom-icon
                icon-first
                .hideTooltip="${this.hideFrsAmountTooltip(
                  this.frsDetails.currencies_match,
                  this.frsDetails.frs,
                  this.intervention.planned_budget.currency!,
                  this._frsTotalAmountWarning
                )}"
              >
                <span slot="field" class="${this.getFrsValueNAClass(this.frsDetails.currencies_match)}">
                  ${this.getFrsTotal(this.frsDetails.currencies_match, this.frsDetails.total_frs_amt)}
                </span>
                <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                <span slot="message">${this._frsTotalAmountWarning}</span>
              </etools-info-tooltip>
            </span>
            <span class="col-data col-2 right-align">
              <etools-info-tooltip
                class="fr-nr-warn currency-mismatch"
                icon-first
                custom-icon
                .hideTooltip="${!this.frsConsistencyWarningIsActive(this.frsDetails.multi_curr_flag)}"
              >
                <span slot="field" class="${this.getFrsValueNAClass(this.frsDetails.multi_curr_flag, true)}">
                  ${this.getFrsTotal(this.frsDetails.multi_curr_flag, String(this.frsDetails.total_actual_amt), true)}
                </span>
                <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                <span slot="message">
                  <span>${this.getFrsMultiCurrFlagErrTooltipMsg()}</span>
                </span>
              </etools-info-tooltip>
            </span>
            <span class="col-data col-2 right-align ${this.getFrsValueNAClass(this.frsDetails.currencies_match)}">
              ${this.getFrsTotal(this.frsDetails.currencies_match, String(this.frsDetails.total_outstanding_amt))}
            </span>
          </div>
        </etools-data-table-row>

        <etools-data-table-row no-collapse id="plannedUnicefCash">
          <div slot="row-data" class="layout-horizontal">
            <span class="col-data col-2"></span>
            <span class="col-data col-2 right-align unicef-cash-col">
              <strong>PLANNED</strong><strong>UNICEF CASH</strong>
            </span>
            <span class="col-data col-2 right-align unicef-cash-col">
              <iron-label for="pd-currency">PD Currency</iron-label>
              ${this.renderPdCurrency()}
            </span>
            <span class="col-data col-2 right-align unicef-cash-col">
              <iron-label for="unicef-cash">UNICEF Cash</iron-label>
              <span id="unicef-cash"
                >${displayCurrencyAmount(this.intervention.planned_budget.unicef_cash_local!, '0.0')}</span
              >
            </span>
            <span class="col-data col-4"></span>
          </div>
        </etools-data-table-row>
      </div>
    `;
  }

  _intervention: Intervention | null = null;

  set intervention(intervention: Intervention | null) {
    this._intervention = intervention;
    this._checkFrsAmountConsistency();
  }

  @property({type: Object})
  get intervention() {
    return this._intervention;
  }

  _frsDetails: FrsDetails | null = null;

  set frsDetails(frsDetails: FrsDetails | null) {
    this._frsDetails = frsDetails;
    this._checkFrsAmountConsistency();
  }

  @property({type: Object})
  get frsDetails() {
    return this._frsDetails;
  }

  @property({type: String})
  _frsTotalAmountWarning!: string;

  _noFrs(frsDetails: FrsDetails) {
    return !frsDetails || !frsDetails.frs || !frsDetails.frs.length;
  }

  _checkFrsAmountConsistency() {
    if (!this.intervention || !this.frsDetails) {
      return;
    }
    if (this._noFrs(this.frsDetails) || !this.intervention || this.intervention.status === 'closed') {
      this._frsTotalAmountWarning = '';
      return;
    }
    const warn = this.checkFrsAndUnicefCashAmountsConsistency(
      this.intervention.planned_budget!.unicef_cash_local!,
      this.frsDetails.total_frs_amt,
      this.intervention,
      'interventionMetadata',
      true
    );
    this._frsTotalAmountWarning = String(warn);
  }

  getValueOrNA(value: any) {
    return value ? value : 'N/A';
  }

  _getOtherStyleIfNA(value: any) {
    return (value ? '' : 'fr-val-not-available') + ' fund-reservations-display';
  }

  getFRNumberLink(frNumber: string) {
    return `https://mappsprd.unicef.org:44300/sap/bc/ui5_ui5/sap/zhact_etools_fr/index.html?Belnr=${frNumber}`;
  }

  renderPdCurrency() {
    const currency = this.intervention!.planned_budget.currency;
    return html`<span id="pd-currency">${currency ? currency : '—'}</span>`;
  }
}
