import {LitElement, customElement, html, property, CSSResult, css} from 'lit-element';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {RootState} from '../common/types/store.types';
import {InterventionReview, User} from '@unicef-polymer/etools-types';
import './general-review-information/general-review-information';
import './review-members/review-members';
import './reviews-list/reviews-list';
import './overall-approval/overall-approval';
import '@unicef-polymer/etools-modules-common/dist/components/cancel/reason-display';
import {NO_REVIEW, PRC_REVIEW} from './review.const';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';

@customElement('intervention-review')
export class InterventionReviewTab extends connectStore(LitElement) {
  @property() canEditReview = false;
  @property() canEditPRCReviews = false;
  @property() review: InterventionReview | null = null;
  @property() unicefUsers: User[] = [];
  @property() cfeiNumber = '';
  @property() interventionStatus = '';

  get linkUrl(): string {
    return `https://www.unpartnerportal.org/cfei/open?agency=1&displayID=${encodeURIComponent(
      this.cfeiNumber
    )}&page=1&page_size=10`;
  }

  private interventionId: number | null = null;

  render() {
    // language=HTML
    return html`
      ${this.review?.sent_back_comment && ['draft', 'development'].includes(this.interventionStatus)
        ? html`<reason-display title="Secretary Comment">
            <div class="text">${this.review?.sent_back_comment}</div>
          </reason-display>`
        : ''}
      ${this.cfeiNumber
        ? html`<reason-display title="CFEI Notification" .cfeiNumber="${this.cfeiNumber}">
            <div class="text">
              This PD was completed after a selection in UNPP where a committee has approved, please review the work
              done in UNPP by clicking this link:
              <a href="${this.linkUrl}" target="_blank">Go to UNPP</a>
            </div>
          </reason-display>`
        : ''}

      <general-review-information .review="${this.review}"></general-review-information>

      ${this.review && this.review.review_type != NO_REVIEW
        ? html`<review-members
              .review="${this.review}"
              .interventionId="${this.interventionId}"
              .usersList="${this.unicefUsers}"
              .canEditAtLeastOneField="${this.canEditReview}"
            ></review-members>

            <reviews-list
              .review="${this.review}"
              .readonly="${!this.canEditPRCReviews}"
              ?hidden="${this.review?.review_type !== PRC_REVIEW}"
            ></reviews-list>

            <overall-approval .review="${this.review}" .readonly="${!this.canEditReview}"></overall-approval>`
        : null}
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(state?.app?.routeDetails, 'interventions', 'review') || !state.interventions.current) {
      return;
    }
    this.review = state.interventions.current.reviews[0] || null;
    this.unicefUsers = state.commonData?.unicefUsersData || [];
    this.canEditReview = state.interventions.current.permissions!.edit.reviews || false;
    this.canEditPRCReviews = state.interventions.current.permissions!.edit.prc_reviews || false;
    this.interventionId = state.interventions.current.id;
    this.interventionStatus = state.interventions.current.status;
    this.cfeiNumber = state.interventions.current.cfei_number || '';
  }

  static get styles(): CSSResult {
    // language=css
    return css`
      *[hidden] {
        display: none !important;
      }
      reason-display {
        --flag-color: #ff9044;
        --text-wrap: none;
        --text-padding: 26px 24px 26px 80px;
      }
      a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;
      }
    `;
  }
}
