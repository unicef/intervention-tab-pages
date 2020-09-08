import {LitElement, html, TemplateResult, customElement, CSSResultArray, css, property} from 'lit-element';
import './final-review-popup';
import {openDialog} from '../../utils/dialog';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import {selectFinalReviewAttachment, selectInterventionId} from './final-review.selectors';
import {ReviewAttachment} from '../../common/models/intervention.types';
import {currentInterventionPermissions} from '../../common/selectors';
import get from 'lodash-es/get';
declare const moment: any;

@customElement('final-review')
export class FinalReview extends connect(getStore())(LitElement) {
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
      `
    ];
  }

  @property() attachment: ReviewAttachment | null = null;
  @property() canEdit = false;

  get reviewDate(): string {
    return this.attachment ? moment(this.attachment.created).format('DD MMM YYYY') : '-';
  }

  private interventionId: number | null = null;

  protected render(): TemplateResult {
    return html`
      <etools-content-panel show-expand-btn panel-title="Final Partnership Review">
        <div slot="panel-btns" ?hidden="${!this.canEdit}">
          <paper-icon-button @tap="${() => this.openPopup()}" icon="create"> </paper-icon-button>
        </div>
        <div class="container">
          <div>
            <div class="label">Date review performed</div>
            <div class="date">${this.reviewDate}</div>
          </div>
          <div ?hidden="${!this.attachment}">
            <a href="${this.attachment?.attachment_file}" target="_blank">
              <iron-icon icon="file-download"></iron-icon>
              <span>${this.getFilenameFromURL(this.attachment?.attachment_file)}</span>
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
    this.interventionId = selectInterventionId(state);
    this.canEdit = Boolean(currentInterventionPermissions(state)?.edit.final_partnership_review);
  }

  openPopup(): void {
    openDialog({
      dialog: 'final-review-popup',
      dialogData: {
        interventionId: this.interventionId,
        attachment: this.attachment
      }
    });
  }

  getFilenameFromURL(url?: string) {
    if (!url) {
      return '';
    }
    return url.split('?')[0].split('/').pop();
  }
}
