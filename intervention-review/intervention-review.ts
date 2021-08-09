import {LitElement, customElement, html, property, CSSResult, css} from 'lit-element';
import {fireEvent} from '../../../etools-pages-common/utils/fire-custom-event';
import {RootState} from '../common/types/store.types';
import {InterventionReview, User} from '@unicef-polymer/etools-types';
import './general-review-information/general-review-information';
import './review-members/review-members';
import './reviews-list/reviews-list';
import './overall-approval/overall-approval';
import {PRC_REVIEW} from './review.const';
import {connectStore} from '../../../etools-pages-common/mixins/connect-store-mixin';
import {pageIsNotCurrentlyActive} from '../../../etools-pages-common/utils/common-methods';

@customElement('intervention-review')
export class InterventionReviewTab extends connectStore(LitElement) {
  @property() canEditReview = false;
  @property() canEditPRCReviews = false;
  @property() review: InterventionReview | null = null;
  @property() unicefUsers: User[] = [];
  private interventionId: number | null = null;

  render() {
    // language=HTML
    return html`
      <general-review-information .review="${this.review}"></general-review-information>

      ${this.review
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
  }

  static get styles(): CSSResult {
    return css`
      *[hidden] {
        display: none !important;
      }
    `;
  }
}
