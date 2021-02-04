import {LitElement, html, TemplateResult, customElement, CSSResultArray, css, property} from 'lit-element';
import './final-review-popup';
import {openDialog} from '../../utils/dialog';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import {selectFinalReviewAttachment, selectFinalReviewDate, selectInterventionId} from './final-review.selectors';
import {currentInterventionPermissions} from '../../common/selectors';
import get from 'lodash-es/get';
import {getFileNameFromURL} from '../../utils/utils';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {ReviewAttachment} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
declare const dayjs: any;

@customElement('final-review')
export class FinalReview extends CommentsMixin(LitElement) {
  static get styles(): CSSResultArray {
    // language=css
    return [
      css`
        .container {
          display: flex;
          align-items: center;
          padding: 10px 0 5px;
        }
        .container div {
          margin-right: 24px;
        }
        .label {
          font-size: 12px;
          line-height: 16px;
          color: var(--secondary-text-color);
        }
        .date {
          font-size: 16px;
          line-height: 24px;
          color: var(--primary-text-color);
        }
        span {
          font-weight: 500;
          font-size: 13px;
          line-height: 24px;
          color: var(--primary-color);
        }
        iron-icon {
          color: var(--primary-color);
        }
        a {
          text-decoration: none;
        }
        *[hidden] {
          display: none !important;
        }
        a:focus {
          outline: 0;
          box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12),
          0 3px 5px -1px rgba(0, 0, 0, 0.4) !important;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
      `
    ];
  }

  @property() attachment: ReviewAttachment | null = null;
  @property() date: string | null = null;
  @property() canEdit = false;

  get reviewDate(): string {
    return this.date ? dayjs(this.date).format('DD MMM YYYY') : '-';
  }

  private interventionId: number | null = null;

  protected render(): TemplateResult {
    return html`
      <style>
        ${sharedStyles}
      </style>
      <etools-content-panel
        show-expand-btn
        panel-title=${translate('INTERVENTION_MANAGEMENT.FINAL_REVIEW.FINAL_PARTNERSHIP_REVIEW')}
        comment-element="final-partnership-review"
        comment-description=${translate('INTERVENTION_MANAGEMENT.FINAL_REVIEW.FINAL_PARTNERSHIP_REVIEW')}
      >
        <div slot="panel-btns" ?hidden="${!this.canEdit}">
          <paper-icon-button @click="${() => this.openPopup()}" icon="create"> </paper-icon-button>
        </div>
        <div class="container">
          <div>
            <div class="label">${translate('INTERVENTION_MANAGEMENT.FINAL_REVIEW.DATE_REVIEW_PERFORMED')}</div>
            <div class="date">${this.reviewDate}</div>
          </div>
          <div ?hidden="${!this.attachment}">
            <a href="${this.attachment?.attachment_document}" target="_blank">
              <iron-icon icon="file-download"></iron-icon>
              <span>${getFileNameFromURL(this.attachment?.attachment_document)}</span>
            </a>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  stateChanged(state: any): void {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'management')) {
      return;
    }

    this.attachment = selectFinalReviewAttachment(state);
    this.date = selectFinalReviewDate(state);
    this.interventionId = selectInterventionId(state);
    this.canEdit = Boolean(currentInterventionPermissions(state)?.edit.final_partnership_review);
    super.stateChanged(state);
  }

  openPopup(): void {
    openDialog({
      dialog: 'final-review-popup',
      dialogData: {
        interventionId: this.interventionId,
        attachment: this.attachment,
        date: this.date
      }
    });
  }
}
