import {css, CSSResultArray, html, LitElement, PropertyValues, TemplateResult} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {ResultStructureStyles} from './styles/results-structure.styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';

import './modals/cp-output-dialog';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';
import {ExpectedResult, Intervention} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {callClickOnSpacePushListener} from '@unicef-polymer/etools-utils/dist/accessibility.util';
import {TruncateMixin} from '../../common/mixins/truncate.mixin';
import {_canDelete} from '../../common/mixins/results-structure-common';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

@customElement('cp-output-level')
export class CpOutputLevel extends TruncateMixin(LitElement) {
  @property() interventionId!: number;
  @property() currency!: string | undefined;
  @property() resultLink!: ExpectedResult;
  @property() interventionInfo!: Partial<Intervention>;
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
                                    (name: string) => html`<li>${this.truncateString(name)}</li>`
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
                        <div class="hover-block" ?hidden="${this.readonly}">
                          <etools-icon-button name="create" @click="${this.openEditCpOutputPopup}"></etools-icon-button>
                          <etools-icon-button
                            name="delete"
                            ?hidden="${!_canDelete(
                              this.resultLink,
                              this.readonly,
                              this.interventionInfo.status!,
                              this.interventionInfo.in_amendment!,
                              this.interventionInfo.in_amendment_date!
                            )}"
                            @click="${this.openDeleteCPOutputPopup}"
                          ></etools-icon-button>
                        </div>
                      `
                    : html`
                        <!--      If PD is unassociated with CP Output      -->
                        <div class="flex-1 flex-fix data alert">${translate('UNASSOCIATED_TO_CP_OUTPUT')}</div>
                      `}
                </div>
                <div class="outputs-count"><b>${this.resultLink.ll_results.length}</b> ${translate('PD_OUTPUT_S')}</div>
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

    this.shadowRoot!.querySelectorAll('etools-icon').forEach((el) => callClickOnSpacePushListener(el));
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
      ...super.styles,
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
        #ram-list {
          padding-inline-start: 19px;
          margin: 2px;
          list-style: circle;
        }
        .cp-output-row {
          line-height: 26px;
          padding-top: 8px;
          padding-bottom: 3px;
          text-wrap: wrap;
          word-wrap: break-word;
        }
        :host div.outputs-count {
          padding: 0 0 9px;
          font-family: Roboto;
          font-size: var(--etools-font-size-14, 14px);
          font-weight: 400;
          line-height: 16px;
          color: #212121;
        }
        div[slot='row-data-details'] {
          background-color: var(--pd-output-background);
        }
        etools-data-table-row {
          overflow: hidden;
          --list-row-wrapper-padding-inline: 0 12px;
          --list-second-bg-color: #c4c4c4;
        }

        etools-data-table-row::part(edt-list-row-collapse-wrapper) {
          padding: 0 !important;
          border: none;
        }
        etools-data-table-row::part(edt-icon-wrapper) {
          padding-block: 11px 0;
          padding-inline: 9px 7px;
          align-self: flex-start;
        }
        etools-data-table-row::part(edt-list-row-wrapper) {
          border-bottom: none !important;
          padding-inline-start: 4px;
          padding-inline-end: 16px;
          background-color: var(--cp-output-background);
        }
        .editable-row:hover .hover-block {
          opacity: 1;
        }
        @media (max-width: 576px) {
          .cp-output-row {
            flex-direction: column;
          }
        }
      `
    ];
  }
}
