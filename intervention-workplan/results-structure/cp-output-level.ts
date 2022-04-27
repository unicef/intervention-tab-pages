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
import {ResultStructureStyles} from './styles/results-structure.styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons';
import './modals/cp-output-dialog';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {ExpectedResult} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {callClickOnSpacePushListener} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {PaperButtonElement} from '@polymer/paper-button';

@customElement('cp-output-level')
export class CpOutputLevel extends LitElement {
  @property() interventionId!: number;
  @property() currency!: string | undefined;
  @property() resultLink!: ExpectedResult;
  @property({type: Boolean, reflect: true, attribute: 'show-cpo-level'}) showCPOLevel = false;
  @property({type: Boolean}) showIndicators = true;
  @property({type: Boolean}) showActivities = true;
  @property({type: Boolean}) readonly = true;
  @property({type: Boolean}) opened = false;

  protected render(): TemplateResult {
    return html`
      ${sharedStyles}
      ${this.showCPOLevel && this.resultLink
        ? html`
            <div class="divider"></div>
            <etools-data-table-row secondary-bg-on-hover .detailsOpened="${this.opened}">
              <div slot="row-data" class="editable-row">
                <div class="layout-horizontal cp-output-row">
                  <!--      If PD is associated with CP Output      -->
                  ${this.resultLink.cp_output
                    ? html`
                        <div class="flex-1 flex-fix">
                          <div class="heading">${translate('COUNTRY_PROGRAME_OUTPUT')}</div>
                          <div class="data">
                            <b>${this.resultLink.code} - </b>&nbsp;${this.resultLink.cp_output_name}
                          </div>
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

                        <div class="flex-none total-cache" ?hidden="${!this.showActivities}">
                          <div class="heading">${translate('TOTAL_CASH_BUDGET')}</div>
                          <div class="data">
                            <span class="currency">${this.currency}</span> ${displayCurrencyAmount(
                              this.resultLink.total,
                              '0.00'
                            )}
                          </div>
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
                <div class="outputs-count"><b>${this.resultLink.ll_results.length}</b> PD Output(s)</div>
              </div>

              <div slot="row-data-details">
                <slot></slot>
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

  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      ResultStructureStyles,
      css`
        :host {
          display: block;
          position: relative;
        }
        :host([show-cpo-level]) .divider {
          position: absolute;
          width: calc(100% - 14px);
          left: 7px;
          top: 0;
          height: 1px;
          background-color: #c4c4c4;
        }
        :host([index='0']) .divider {
          display: none;
        }
        .alert {
          color: var(--error-color);
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
        .cp-output-row {
          line-height: 26px;
          padding-top: 8px;
          padding-bottom: 3px;
        }
        :host div.outputs-count {
          padding: 0 0 9px;
          font-family: Roboto;
          font-size: 14px;
          font-weight: 400;
          line-height: 16px;
          color: #212121;
        }
        div[slot='row-data-details'] {
          background-color: var(--pd-output-background);
        }
        etools-data-table-row {
          overflow: hidden;
          --list-row-wrapper-padding: 0 12px 0 0;
          --list-second-bg-color: #c4c4c4;
        }

        etools-data-table-row::part(edt-list-row-collapse-wrapper) {
          padding: 0 !important;
          border: none;
        }
        etools-data-table-row::part(edt-icon-wrapper) {
          padding: 11px 7px 0 9px;
          align-self: flex-start;
        }
        etools-data-table-row::part(edt-list-row-wrapper) {
          border-bottom: none !important;
          padding-left: 4px;
          padding-right: 16px;
          background-color: var(--cp-output-background);
        }
        .editable-row:hover .hover-block {
          opacity: 1;
        }
      `
    ];
  }
}
