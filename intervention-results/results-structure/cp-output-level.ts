import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  property,
  PropertyValues,
  TemplateResult
} from 'lit-element';
import {ResultStructureStyles} from './results-structure.styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import '@unicef-polymer/etools-data-table';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons';
import './modals/cp-output-dialog';
import {fireEvent} from '../../utils/fire-custom-event';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {ExpectedResult} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {callClickOnSpacePush} from '../../utils/common-methods';

@customElement('cp-output-level')
export class CpOutputLevel extends LitElement {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      ResultStructureStyles,
      css`
        :host {
          display: block;
        }
        :host([show-cpo-level]) {
          border-top: 1px solid var(--main-border-color);
        }
        :host(:first-child) {
          border-top: none;
        }
        .alert {
          color: var(--error-color);
        }
        .editable-row .hover-block {
          background-color: rgb(240, 240, 240);
        }
      `
    ];
  }

  @property() interventionId!: number;
  @property() currency!: string | undefined;
  @property() resultLink!: ExpectedResult;
  @property({type: Boolean, reflect: true, attribute: 'show-cpo-level'}) showCPOLevel = false;
  @property({type: Boolean}) showIndicators = true;
  @property({type: Boolean}) showActivities = true;
  @property({type: Boolean})
  readonly = true;

  protected render(): TemplateResult {
    return html`
      <style>
        ${sharedStyles} etools-data-table-row {
          overflow: hidden;
          --list-row-wrapper-padding: 0 12px 0 0;
          --list-row-collapse-wrapper: {
            padding: 0 !important;
            margin-bottom: 10px;
            border: 1px solid var(--main-border-color) !important;
            border-bottom: 1px solid var(--main-border-color) !important;
          }
          --list-row-wrapper: {
            border-bottom: none !important;
          }
        }
        .higher-slot .heading {
          margin-top: 12px;
        }
      </style>
      ${this.showCPOLevel && this.resultLink
        ? html`
            <etools-data-table-row secondary-bg-on-hover details-opened>
              <div slot="row-data" class="layout-horizontal editable-row higher-slot">
                <!--      If PD is associated with CP Output      -->
                ${this.resultLink.cp_output
                  ? html`
                      <div class="flex-1 flex-fix">
                        <div class="heading">
                          ${translate('INTERVENTION_RESULTS.RESULTS_STRUCTURE.COUNTRY_PROGRAME_OUTPUT')}
                        </div>
                        <div class="data">${this.resultLink.cp_output_name}</div>
                      </div>

                      <div class="flex-1 flex-fix" ?hidden="${!this.showIndicators}">
                        <div class="heading">${translate('INTERVENTION_RESULTS.RESULTS_STRUCTURE.RAM_INDICATORS')}</div>
                        <div class="data">
                          ${this.resultLink.ram_indicator_names.length
                            ? this.resultLink.ram_indicator_names.map((name: string) => html`<div>${name}</div>`)
                            : '—'}
                        </div>
                      </div>

                      <div class="flex-none" ?hidden="${!this.showActivities}">
                        <div class="heading">${translate('INTERVENTION_RESULTS.TOTAL_CASH_BUDGET')}</div>
                        <div class="data">${this.currency} ${displayCurrencyAmount(this.resultLink.total, '0.00')}</div>
                      </div>

                      <div class="hover-block">
                        <paper-icon-button
                          icon="icons:create"
                          ?hidden="${this.readonly}"
                          @click="${this.openEditCpOutputPopup}"
                        ></paper-icon-button>
                        <paper-icon-button
                          icon="icons:delete"
                          ?hidden="${this.readonly}"
                          @click="${this.openDeleteCPOutputPopup}"
                        ></paper-icon-button>
                      </div>
                    `
                  : html`
                      <!--      If PD is unassociated with CP Output      -->
                      <div class="flex-1 flex-fix data alert">
                        ${translate('INTERVENTION_RESULTS.RESULTS_STRUCTURE.UNASSOCIATED_TO_CP_OUTPUT')}
                      </div>
                    `}
              </div>

              <div slot="row-data-details">
                <slot></slot>

                <div class="add-pd row-h align-items-center" ?hidden="${!this.resultLink.cp_output || this.readonly}">
                  <paper-icon-button icon="add-box" @click="${() => this.addPD()}"></paper-icon-button>
                  ${translate('INTERVENTION_RESULTS.RESULTS_STRUCTURE.ADD_PD_OUTPUT')}
                </div>
              </div>
            </etools-data-table-row>
          `
        : html`<slot></slot>`}
    `;
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    this.shadowRoot!.querySelectorAll('iron-icon').forEach((el) => callClickOnSpacePush(el));
  }

  openEditCpOutputPopup(): void {
    fireEvent(this, 'edit-cp-output');
  }

  openDeleteCPOutputPopup() {
    fireEvent(this, 'delete-cp-output');
  }

  addPD(): void {
    fireEvent(this, 'add-pd');
  }
}
