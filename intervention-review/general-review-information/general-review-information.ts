import {LitElement, TemplateResult, html, customElement, property, CSSResultArray, css} from 'lit-element';
import {InterventionReview} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {formatDate} from '../../utils/date-utils';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {REVIEW_TYPES} from '../review.const';
import '@unicef-polymer/etools-content-panel/etools-content-panel';

@customElement('general-review-information')
export class GeneralReviewInformation extends LitElement {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      sharedStyles,
      css`
        *[hidden] {
          display: none;
        }
        .container {
          min-height: 4rem;
          align-items: center;
        }
        .label {
          font-size: 12px;
          line-height: 16px;
          color: var(--secondary-text-color);
        }
        .value {
          font-size: 16px;
          line-height: 24px;
          color: var(--primary-text-color);
        }
        .info-block {
          margin-right: 1.5rem;
          min-width: 110px;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
      `
    ];
  }
  @property() review?: InterventionReview;

  get reviewCreatedDate(): string {
    return this.review?.started_date ? formatDate(this.review.started_date, 'DD MMM YYYY') : '-';
  }

  render(): TemplateResult {
    // language=HTML
    return html`
      <etools-content-panel panel-title="${translate('INTERVENTION_REVIEW')}">
        <div class="row-padding-v">
          <div ?hidden="${this.review}">${translate('EMPTY_REVIEW')}</div>

          <div ?hidden="${!this.review}" class="container layout-horizontal">
            <div class="info-block">
              <div class="label">${translate('REVIEW_CREATED')}</div>
              <div class="value">${this.reviewCreatedDate}</div>
            </div>
            <div class="info-block">
              <div class="label">${translate('REVIEW_TYPE')}</div>
              <div class="value">${REVIEW_TYPES.get(this.review?.review_type || '-')}</div>
            </div>
            <div class="info-block">
              <div class="label">${translate('STARTED_BY')}</div>
              <div class="value">${this.review?.started_by?.name || '-'}</div>
            </div>
          </div>
        </div>
      </etools-content-panel>
    `;
  }
}
