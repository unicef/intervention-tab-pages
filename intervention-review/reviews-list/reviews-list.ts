import {customElement, LitElement, html, CSSResultArray, css, TemplateResult, property} from 'lit-element';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {translate} from 'lit-translate';
import {InterventionReview, PrcOfficerReview} from '@unicef-polymer/etools-types';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {loadPrcMembersIndividualReviews} from '../../common/actions/officers-reviews';
import isEqual from 'lodash-es/isEqual';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {RootState} from '../../common/types/store.types';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {REVIEW_ANSVERS, REVIEW_QUESTIONS} from '../review.const';
import {formatDate} from '@unicef-polymer/etools-modules-common/dist/utils/date-utils';
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

  private _review!: InterventionReview;
  set review(review: InterventionReview) {
    // Info: this._review is not persisted on nav to list and back to pd review (component is removed from DOM)
    const oldOfficers: number[] | undefined = this._review ? this._review.prc_officers : undefined;

    this._review = review;
    if (oldOfficers == undefined || !isEqual(oldOfficers, review?.prc_officers)) {
      getStore().dispatch<any>(loadPrcMembersIndividualReviews(review.id));
    }
  }

  @property({type: Object})
  get review(): InterventionReview {
    return this._review;
  }

  @property() approvals: PrcOfficerReview[] = [];
  @property() readonly = false;
  @property() currentUserId!: number;

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
    this.approvals = state.prcIndividualReviews || [];
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
