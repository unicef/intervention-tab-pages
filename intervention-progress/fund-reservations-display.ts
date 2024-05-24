import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import isEmpty from 'lodash-es/isEmpty';
import {AnyObject} from '@unicef-polymer/etools-types';
import {Intervention, FrsDetails} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {frWarningsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/fr-warnings-styles';
import FrNumbersConsistencyMixin from '@unicef-polymer/etools-modules-common/dist/mixins/fr-numbers-consistency-mixin';
import {prettyDate} from '@unicef-polymer/etools-utils/dist/date.util';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

/**
 * @customElement
 */
@customElement('fund-reservations-display')
export class FundReservationsDisplay extends FrNumbersConsistencyMixin(LitElement) {
  static get styles() {
    return [frWarningsStyles, layoutStyles];
  }
  render() {
    if (!this.frsDetails || !this.intervention) {
      return html`<etools-loading source="fund-res-display" active></etools-loading>`;
    }
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit} :host {
          --list-column-label: {
            margin-inline-end: 0;
          }
        }
        #totalsRow {
          --list-row-no-collapse-bg-color: var(--light-theme-background-color);
          --list-bg-color: var(--light-theme-background-color);
        }
        #plannedUnicefCash,
        #totalsRow {
          --list-row-wrapper-padding-inline: 56px 24px;
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
        .unicef-cash-col label {
          font-size: var(--etools-font-size-12, 12px);
          color: var(--secondary-text-color);
          font-weight: bold;
        }
        div[simple-header] > span,
        div[simple-row] > span {
          padding-inline-end: 24px;
        }
        div[simple-header] {
          color: var(--list-secondary-text-color, #757575);
        }
        .pl-5 {
          padding-inline-start: 5px;
        }
        *[slot='row-data'] {
          margin-top: 12px !important;
          margin-bottom: 12px !important;
        }
        etools-data-table-row[low-resolution-layout] *[slot='row-data'] .col-data,
        etools-data-table-row[low-resolution-layout] *[slot='row-data-details'] > * {
          display: inline-flex !important;
        }
        .right-align {
          justify-content: flex-end !important;
        }
        .row.padding-row {
          padding: 16px 24px;
        }
      </style>

      <etools-media-query
        query="(max-width: 767px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>

      <div class="row padding-row" ?hidden="${this.frsDetails.frs.length}">
        <p>${translate('NO_FUND_RESERVATIONS')}</p>
      </div>

      <div class="list-container" ?hidden="${this._noFrs(this.frsDetails)}">
        <etools-data-table-header
          .lowResolutionLayout="${this.lowResolutionLayout}"
          id="listHeader"
          no-title
          ?hidden="${!this.frsDetails || !this.frsDetails.frs.length}"
        >
          <etools-data-table-column class="col-2"> FR# </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align">
            ${translate('FR_POSTING_DATE')}
          </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align"> ${translate('FR_CURRENCY')} </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align"> ${translate('FR_AMOUNT')} </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align">
            ${translate('ACTUAL_DISBURS')}
          </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align">
            ${translate('OUTSTANDING_DCT')}</etools-data-table-column
          >
        </etools-data-table-header>

        ${this.frsDetails.frs.map(
          (fr: AnyObject) => html`
            <etools-data-table-row .lowResolutionLayout="${this.lowResolutionLayout}">
              <div slot="row-data" class="layout-horizontal">
                <span class="col-data col-2" data-col-header-label="FR#"
                  >${fr.fr_number}
                  <a title="See more details" class="pl-5" target="_blank" href="${this.getFRNumberLink(fr.fr_number)}">
                    <etools-icon class="lifted-up-icon" name="external-icon"></etools-icon>
                  </a>
                </span>
                <span
                  class="col-data col-2 ${!this.lowResolutionLayout ? 'right-align' : ''}"
                  data-col-header-label="${translate('FR_POSTING_DATE')}"
                  >${prettyDate(fr.start_date)}</span
                >
                <span
                  class="col-data col-2 ${!this.lowResolutionLayout ? 'right-align' : ''}"
                  data-col-header-label="${translate('FR_CURRENCY')}"
                >
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
                    <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
                    <span slot="message">
                      <span>${this.getFrCurrencyTooltipMsg()}</span>
                    </span>
                  </etools-info-tooltip>
                </span>
                <span
                  class="col-data col-2 ${!this.lowResolutionLayout ? 'right-align' : ''}"
                  data-col-header-label="${translate('FR_AMOUNT')}"
                  >${displayCurrencyAmount(fr.total_amt_local, '0.00')}</span
                >
                <span
                  class="col-data col-2 ${!this.lowResolutionLayout ? 'right-align' : ''}"
                  data-col-header-label="${translate('ACTUAL_DISBURS')}"
                >
                  <etools-info-tooltip
                    class="fr-nr-warn currency-mismatch"
                    icon-first
                    custom-icon
                    .hideTooltip="${!this.frsConsistencyWarningIsActive(fr.multi_curr_flag)}"
                  >
                    <span slot="field" class="${this.getFrsValueNAClass(fr.multi_curr_flag, true)}">
                      ${this.getFrsTotal(fr.multi_curr_flag, fr.actual_amt_local, true)}
                    </span>
                    <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
                    <span slot="message">
                      <span>${this.getFrsMultiCurrFlagErrTooltipMsg()}</span>
                    </span>
                  </etools-info-tooltip>
                </span>
                <span
                  class="col-data col-2 ${!this.lowResolutionLayout ? 'right-align' : ''}"
                  data-col-header-label="${translate('OUTSTANDING_DCT')}"
                  >${displayCurrencyAmount(fr.outstanding_amt_local, '0.00')}</span
                >
              </div>
              <div slot="row-data-details">
                <div class="row" ?hidden="${isEmpty(fr.line_item_details)}">
                  <div simple-header class="layout-horizontal">
                    <span class="col-2">${translate('FR_LINE_ITEM')}</span>
                    <span class="col-2">${translate('DONOR')}</span>
                    <span class="col-2">${translate('GRANT')}</span>
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
                <div class="row" ?hidden="${!isEmpty(fr.line_item_details)}">${translate('NO_DETAILS_TO_DISPLAY')}</div>
              </div>
            </etools-data-table-row>
          `
        )}

        <etools-data-table-row no-collapse id="totalsRow" .lowResolutionLayout="${this.lowResolutionLayout}">
          <div slot="row-data" class="layout-horizontal">
            ${this.lowResolutionLayout ? '' : html`<span class="col-data col-2"></span>`}
            <span class="col-data col-2 ${!this.lowResolutionLayout ? 'right-align' : ''}" data-col-header-label="FR#"
              ><strong>${translate('TOTAL_OF_FRS')}</strong></span
            >
            <span
              class="col-data col-2 ${!this.lowResolutionLayout ? 'right-align' : ''}"
              data-col-header-label="${translate('FR_CURRENCY')}"
            >
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
                <etools-icon
                  name="${this.getFrsCurrencyTooltipIcon(this.frsDetails.currencies_match)}"
                  slot="custom-icon"
                ></etools-icon>
                <span slot="message">${this.getFrsCurrencyTooltipMsg(this.frsDetails.currencies_match)}</span>
              </etools-info-tooltip>
            </span>
            <span
              class="col-data col-2 ${!this.lowResolutionLayout ? 'right-align' : ''}"
              data-col-header-label="${translate('FR_AMOUNT')}"
            >
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
                <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
                <span slot="message">${this._frsTotalAmountWarning}</span>
              </etools-info-tooltip>
            </span>
            <span
              class="col-data col-2 ${!this.lowResolutionLayout ? 'right-align' : ''}"
              data-col-header-label="${translate('ACTUAL_DISBURS')}"
            >
              <etools-info-tooltip
                class="fr-nr-warn currency-mismatch"
                icon-first
                custom-icon
                .hideTooltip="${!this.frsConsistencyWarningIsActive(this.frsDetails.multi_curr_flag)}"
              >
                <span slot="field" class="${this.getFrsValueNAClass(this.frsDetails.multi_curr_flag, true)}">
                  ${this.getFrsTotal(this.frsDetails.multi_curr_flag, String(this.frsDetails.total_actual_amt), true)}
                </span>
                <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
                <span slot="message">
                  <span>${this.getFrsMultiCurrFlagErrTooltipMsg()}</span>
                </span>
              </etools-info-tooltip>
            </span>
            <span
              class="col-data col-2 ${!this.lowResolutionLayout ? 'right-align' : ''} ${this.getFrsValueNAClass(
                this.frsDetails.currencies_match
              )}"
              data-col-header-label="${translate('OUTSTANDING_DCT')}"
            >
              ${this.getFrsTotal(this.frsDetails.currencies_match, String(this.frsDetails.total_outstanding_amt))}
            </span>
          </div>
        </etools-data-table-row>

        <etools-data-table-row no-collapse id="plannedUnicefCash">
          <div slot="row-data" class="layout-horizontal">
            ${this.lowResolutionLayout ? '' : html`<span class="col-data col-2"></span>`}
            <span class="col-data col-4 col-md-2 right-align unicef-cash-col">
              <strong>${translate('PLANNED')}</strong><strong>${translate('UNICEF_CASH')}</strong>
            </span>
            <span class="col-data col-4 col-md-2 right-align unicef-cash-col">
              <label for="pd-currency">${translate('PD_CURRENCY')}</label>
              ${this.renderPdCurrency()}
            </span>
            <span class="col-data col-4 col-md-2 right-align unicef-cash-col">
              <label for="unicef-cash">${translate('UNICEF_CASH')}</label>
              <span id="unicef-cash"
                >${displayCurrencyAmount(this.intervention.planned_budget.unicef_cash_local!, '0.0')}</span
              >
            </span>
            ${this.lowResolutionLayout ? '' : html`<span class="col-data col-4"></span>`}
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

  @property({type: Boolean})
  lowResolutionLayout = false;

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
