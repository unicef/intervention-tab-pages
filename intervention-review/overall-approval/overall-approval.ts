import {customElement, LitElement, html, CSSResultArray, css, TemplateResult, property} from 'lit-element';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import '@unicef-polymer/etools-data-table/etools-data-table';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {translate} from 'lit-translate';
import {InterventionReview} from '@unicef-polymer/etools-types';
import {REVIEW_ANSVERS, REVIEW_QUESTIONS} from '../../common/components/intervention/review.const';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {formatDate} from '@unicef-polymer/etools-utils/dist/date.util';
import '../../common/components/intervention/review-checklist-popup';
import {translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';

@customElement('overall-approval')
export class OverallApproval extends LitElement {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      css`
        :host {
          margin-top: 24px;
          --list-row-wrapper-padding: 0;
          --list-row-wrapper-padding-inline: 0;
        }
        .no-approval {
          padding: 16px 24px;
        }
        paper-icon-button {
          margin-inline-end: 16px;
        }
        .label {
          font-size: 12px;
          line-height: 16px;
          color: var(--secondary-text-color);
        }
        .answer,
        .value {
          font-size: 16px;
          line-height: 24px;
          color: var(--primary-text-color);
        }
        .info-block {
          margin-inline-end: 1.5rem;
          min-width: 110px;
        }
        etools-data-table-row::part(edt-list-row-wrapper):hover {
          background-color: var(--primary-background-color);
        }
        .multiline {
          white-space: pre-line;
        }
        .answer:not(:last-of-type) {
          margin-bottom: 20px;
        }
      `
    ];
  }

  @property() review!: InterventionReview;
  @property() readonly = false;

  render(): TemplateResult {
    return html`
      ${sharedStyles}
      <etools-content-panel class="content-section" panel-title=${translate('OVERALL_REVIEW')}>
        <div slot="panel-btns" ?hidden="${this.readonly}">
          <paper-icon-button icon="icons:create" @click="${() => this.openReviewPopup()}"></paper-icon-button>
        </div>
        <etools-data-table-row class="overall-row" no-collapse details-opened>
          <div slot="row-data">
            <div class="layout-horizontal row-padding space-between">
              <div class="info-block">
                <div class="label">${translate('REVIEW_DATE_PRC')}</div>
                <div class="value">
                  ${this.review.review_date ? formatDate(this.review.review_date, 'DD MMM YYYY') : '-'}
                </div>
              </div>
              <div class="info-block">
                <div class="label">${translate('APPROVED_BY_PRC')}</div>
                <div class="value">
                  ${typeof this.review.overall_approval === 'boolean'
                    ? html` <iron-icon icon="${this.review.overall_approval ? 'check' : 'close'}"></iron-icon>`
                    : '-'}
                </div>
              </div>
            </div>
            <div class="info-block row-padding">
              <div class="label">${translate('APPROVAL_COMMENT')}</div>
              <div class="value">${this.review?.overall_comment || '-'}</div>
            </div>
            <div class="info-block row-padding">
              <div class="label">${translate('ACTIONS_LIST')}</div>
              <div class="value multiline">${this.review?.actions_list || '-'}</div>
            </div>
            <div class="row-padding">
              ${Object.entries(REVIEW_QUESTIONS).map(
                ([field]: [string, string], index: number) => html`
                  <label class="paper-label">Q${index + 1}: ${translateValue(field, 'REVIEW_QUESTIONS')}</label>
                  <div class="answer">
                    ${translateValue(
                      REVIEW_ANSVERS.get(String(this.review[field as keyof InterventionReview])) || '-',
                      'REVIEW_ANSWERS'
                    )}
                  </div>
                `
              )}
            </div>
          </div>
        </etools-data-table-row>
      </etools-content-panel>
    `;
  }

  openReviewPopup() {
    openDialog({
      dialog: 'review-checklist-popup',
      dialogData: {
        isOverall: true
      }
    }).then(({confirmed}) => {
      return confirmed;
    });
  }
}
