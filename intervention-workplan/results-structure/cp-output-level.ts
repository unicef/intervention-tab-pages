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
import {gridLayoutStylesLit} from '../../../../etools-pages-common/styles/grid-layout-styles-lit';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons';
import './modals/cp-output-dialog';
import {fireEvent} from '../../utils/fire-custom-event';
import {sharedStyles} from '../../../../etools-pages-common/styles/shared-styles-lit';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {ExpectedResult} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {callClickOnSpacePushListener} from '../../utils/common-methods';
import {PaperButtonElement} from '@polymer/paper-button';

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
        :host([index='0']) {
          border-top: none !important;
        }
        .alert {
          color: var(--error-color);
        }
        .editable-row .hover-block {
          background-color: rgb(240, 240, 240);
        }
        .show-more-btn {
          margin: 0;
          padding: 0;
          min-width: 15px;
          font-weight: bold;
          color: var(--primary-color);
        }
        #ram-list {
          padding-inline-start: 19px;
          margin: 2px;
          list-style: circle;
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
        }

        etools-data-table-row::part(edt-list-row-collapse-wrapper) {
          padding: 0 !important;
          margin-bottom: 10px;
          border: 1px solid var(--main-border-color) !important;
          border-bottom: 1px solid var(--main-border-color) !important;
        }
        etools-data-table-row::part(edt-list-row-wrapper) {
          border-bottom: none !important;
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
                        <div class="heading">${translate('COUNTRY_PROGRAME_OUTPUT')}</div>
                        <div class="data">${this.resultLink.cp_output_name}</div>
                      </div>

                      <div class="flex-1 flex-fix" ?hidden="${!this.showIndicators}">
                        <div class="heading">${translate('RAM_INDICATORS')}</div>
                        <div class="data">
                          <ul id="ram-list">
                            ${this.resultLink.ram_indicator_names.length
                              ? this.resultLink.ram_indicator_names.map(
                                  (name: string, index: number) =>
                                    html`<li>
                                      ${this.first60Chars(name, index)}${this.from61sthCharOnwards(name, index)}
                                    </li>`
                                )
                              : '—'}
                          </ul>
                        </div>
                      </div>

                      <div class="flex-none" ?hidden="${!this.showActivities}">
                        <div class="heading">${translate('TOTAL_CASH_BUDGET')}</div>
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
                      <div class="flex-1 flex-fix data alert">${translate('UNASSOCIATED_TO_CP_OUTPUT')}</div>
                    `}
              </div>

              <div slot="row-data-details">
                <slot></slot>

                <div class="add-pd row-h align-items-center" ?hidden="${!this.resultLink.cp_output || this.readonly}">
                  <paper-icon-button icon="add-box" @click="${() => this.addPD()}"></paper-icon-button>
                  ${translate('ADD_PD_OUTPUT')}
                </div>
              </div>
            </etools-data-table-row>
          `
        : html`<slot></slot>`}
    `;
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    this.shadowRoot!.querySelectorAll('iron-icon').forEach((el) => callClickOnSpacePushListener(el));
  }

  first60Chars(name: string, index: number) {
    if (name.length <= 60) {
      return name;
    }
    return html`${name.substring(0, 60)}<paper-button
        class="show-more-btn"
        id="show-more"
        @click="${(event: CustomEvent) => this.showMore(event, index)}"
        >...</paper-button
      >`;
  }

  from61sthCharOnwards(name: string, index: number) {
    if (name.length <= 60) {
      return '';
    }
    return html`<span id="more-${index}" hidden aria-hidden>${name.substring(60, name.length)}</span>`;
  }

  private showMore(event: CustomEvent, index: number) {
    const paperBtn = event.target as PaperButtonElement;
    paperBtn.setAttribute('hidden', '');
    const firstparent = paperBtn.parentElement;
    const span = firstparent?.querySelector('#more-' + index);
    span?.removeAttribute('hidden');
    span?.removeAttribute('aria-hidden');
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
