import {customElement, LitElement, html, CSSResultArray, css, TemplateResult, property} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../etools-pages-common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../../../etools-pages-common/styles/shared-styles-lit';
import {translate} from 'lit-translate';
import {InterventionReview, PrcOfficerReview} from '@unicef-polymer/etools-types';
import {getStore} from '../../../../etools-pages-common/utils/redux-store-access';
import {loadReviews} from '../../common/actions/officers-reviews';
import {isEqual} from 'lodash-es';
import {connectStore} from '../../../../etools-pages-common/mixins/connect-store-mixin';
import {RootState} from '../../common/types/store.types';
import {pageIsNotCurrentlyActive} from '../../../../etools-pages-common/utils/common-methods';
import {openDialog} from '../../../../etools-pages-common/utils/dialog';
import {REVIEW_ANSVERS, REVIEW_QUESTIONS} from '../review.const';
import {formatDate} from '../../../../etools-pages-common/utils/date-utils';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '../../common/components/intervention/review-checklist-popup';

@customElement('reviews-list')
export class ReviewsList extends connectStore(LitElement) {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      css`
        :host {
          margin-top: 24px;
        }
        div[slot='row-data'] {
          display: flex;
          position: relative;
        }
        div[slot='row-data'] div {
          padding-right: 16px;
        }
        .answer {
          font-size: 14px;
          margin-bottom: 10px;
        }
        .answer:last-child {
          margin-bottom: 0;
        }
      `
    ];
  }

  @property() set review(review: InterventionReview) {
    const oldOfficers: number[] = this._review?.prc_officers || [];
    this._review = review;
    if (!isEqual(oldOfficers, review?.prc_officers)) {
      getStore().dispatch<any>(loadReviews(review.id));
    }
  }

  get review(): InterventionReview {
    return this._review;
  }

  @property() approvals: PrcOfficerReview[] = [];
  @property() readonly = false;
  @property() currentUserId!: number;

  private _review!: InterventionReview;

  render(): TemplateResult {
    return html`
      ${sharedStyles}
      <etools-content-panel class="content-section" panel-title="PRC Member Reviews">
        <etools-data-table-header no-title ?no-collapse="${!this.approvals.length}">
          <etools-data-table-column class="flex-2">${translate('PRC_NAME')}</etools-data-table-column>
          <etools-data-table-column class="flex-1">${translate('APPROVED_BY_PRC')}</etools-data-table-column>
          <etools-data-table-column class="flex-4">${translate('APPROVAL_COMMENT')}</etools-data-table-column>
          <etools-data-table-column class="flex-1">${translate('REVIEW_DATE_PRC')}</etools-data-table-column>
        </etools-data-table-header>
        ${this.approvals.map(
          (approval) => html`
            <etools-data-table-row>
              <div slot="row-data" class="editable-row">
                <div class="flex-2">${approval.user.name}</div>
                <div class="flex-1">
                  <iron-icon icon="${approval.overall_approval ? 'check' : 'close'}"></iron-icon>
                </div>
                <div class="flex-4">${approval.overall_comment || '-'}</div>
                <div class="flex-1">${formatDate(approval.review_date as string, 'DD MMM YYYY')}</div>
                <div class="hover-block" ?hidden="${this.readonly || approval.user.id !== this.currentUserId}">
                  <paper-icon-button
                    icon="icons:create"
                    @click="${() => this.openReviewPopup(approval)}"
                  ></paper-icon-button>
                </div>
              </div>

              <div slot="row-data-details">
                ${Object.entries(REVIEW_QUESTIONS).map(
                  ([field, question]: [string, string], index: number) => html`
                    <div>
                      <label class="paper-label">Q${index + 1}: ${question}</label>
                    </div>
                    <div class="answer">${REVIEW_ANSVERS.get((approval as any)[field]) || '-'}</div>
                  `
                )}
              </div>
            </etools-data-table-row>
          `
        )}
        <etools-data-table-row no-collapse ?hidden="${this.approvals.length}">
          <div slot="row-data">
            <div class="flex-2">-</div>
            <div class="flex-1">-</div>
            <div class="flex-4">-</div>
            <div class="flex-1">-</div>
          </div>
        </etools-data-table-row>
      </etools-content-panel>
    `;
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(state?.app?.routeDetails, 'interventions', 'review')) {
      return;
    }
    this.approvals = state.reviews || [];
    this.currentUserId = state.user.data!.user;
  }

  openReviewPopup(review?: any) {
    openDialog({
      dialog: 'review-checklist-popup',
      dialogData: {
        review
      }
    }).then(({confirmed}) => {
      return confirmed;
    });
  }
}
