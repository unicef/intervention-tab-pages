import {LitElement, TemplateResult, html, CSSResultArray, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {InterventionReview} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {formatDate} from '@unicef-polymer/etools-utils/dist/date.util';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {PRC_REVIEW, NON_PRC_REVIEW, NO_REVIEW} from '../../common/components/intervention/review.const';
import {get as getTranslation} from 'lit-translate';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import { SlSelectEvent } from '@shoelace-style/shoelace/dist/events/sl-select';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import { fireEvent } from '@unicef-polymer/etools-utils/dist/fire-event.util';

@customElement('general-review-information')
export class GeneralReviewInformation extends LitElement {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      css`
        *[hidden] {
          display: none;
        }
        .container {
          min-height: 4rem;
          align-items: center;
        }
        .label {
          font-size: var(--etools-font-size-12, 12px);
          line-height: 16px;
          color: var(--secondary-text-color);
        }
        .value {
          font-size: var(--etools-font-size-16, 16px);
          line-height: 24px;
          color: var(--primary-text-color);
        }
        .info-block {
          margin-inline-end: 1.5rem;
          min-width: 110px;
        }
        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
        div[slot='panel-btns'] {
          opacity: 1;
        }
        #history-button {
          display: block;
          height: 32px;
          color: #5c5c5c;
          padding: 0;
          box-sizing: border-box;
        }
        sl-dropdown sl-menu-item:focus-visible::part(base) {
          background-color: rgba(0, 0, 0, 0.1);
          color: var(--sl-color-neutral-1000);
        }
        sl-menu-item::part(base) {
          line-height: 38px;
        }
        sl-menu-item[checked]::part(checked-icon) {
          color: var(--sl-color-primary-600);
          width: 24px;
          visibility: visible;
        }
        sl-menu-item[checked]::part(base) {
          background-color: #dcdcdc;
          color: var(--sl-color-neutral-1000);
        }
        sl-menu-item[checked]:focus-visible::part(base) {
          background-color: #cfcfcf;
        }
        etools-button {
          --sl-input-height-medium: 32px;
          --sl-color-neutral-700: rgb(92, 92, 92);
          --sl-color-neutral-300: rgb(92, 92, 92);
          --sl-input-border-radius-medium: 10px;
          border-radius: 10px;
          --sl-spacing-medium: 12px;
          --sl-color-primary-50: transparent;
          --sl-color-primary-300: rgb(92, 92, 92);
          --sl-color-primary-700: rgb(92, 92, 92);
        }       
      `
    ];
  }
  @property() currentReview?: InterventionReview;
  @property() reviews: InterventionReview[] = [];

  @property({type: Object})
  reviewTypes = new Map([
    [PRC_REVIEW, getTranslation('PRC_REVIEW')],
    [NON_PRC_REVIEW, getTranslation('NON_PRC_REVIEW')],
    [NO_REVIEW, getTranslation('NO_REVIEW')]
  ]);

  get reviewCreatedDate(): string {
    return (this.currentReview?.created_date ? formatDate(this.currentReview.created_date, 'DD MMM YYYY') : '-') || '-';
  }

  render(): TemplateResult {
    // language=HTML
    return html`
      ${sharedStyles}
      <etools-content-panel class="content-section" panel-title="${translate('INTERVENTION_REVIEW')}">
        <div slot="panel-btns" class="layout-horizontal">
          <div class="layout-horizontal align-items-center">
              <sl-dropdown
                id="history-button"
                hoist
                close-on-activate
                horizontal-align
                @sl-select=${(e: SlSelectEvent) => {
                  console.log('selected...', e.detail.item.value);
                  fireEvent(this, 'review-changed', {id: e.detail.item.value});
                }}
              >
                <etools-button variant="default" slot="trigger" caret>Review History</etools-button>
                <sl-menu>
                  ${this.reviews.map(
                    (item) =>
                      html` <sl-menu-item
                        @click=${(e: Event) => {
                          // prevent selecting checked item
                          if ((e.target as any).checked) {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                          }
                        }}
                        .checked="${this.currentReview?.id === item.id}"
                        value="${item.id}"
                        type="checkbox"
                      >
                        ${item.review_date} ${item.review_type}
                      </sl-menu-item>`
                  )}
                </sl-menu>
              </sl-dropdown>
              <etools-button id="reviewDownload" variant="text" class="download-button primary-btn" title="Download">
                <etools-icon name="cloud-download" class="dw-icon"></etools-icon> Download
              </etools-button>
            </div>
        </div>
        <div class="row-padding-v">
          <div ?hidden="${this.currentReview}">${translate('EMPTY_REVIEW')}</div>

          <div ?hidden="${!this.currentReview}" class="container layout-horizontal">
            <div class="info-block">
              <div class="label">${translate('REVIEW_CREATED')}</div>
              <div class="value">${this.reviewCreatedDate}</div>
            </div>
            <div class="info-block">
              <div class="label">${translate('REVIEW_TYPE')}</div>
              <div class="value">${this.reviewTypes.get(this.currentReview?.review_type || '-')}</div>
            </div>
            <div class="info-block">
              <div class="label">${translate('SUBMITTED_BY')}</div>
              <div class="value">${this.currentReview?.submitted_by?.name || '-'}</div>
            </div>
          </div>
        </div>
      </etools-content-panel>
    `;
  }
}
