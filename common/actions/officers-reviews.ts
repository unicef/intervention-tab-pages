import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {PrcOfficerReview} from '@unicef-polymer/etools-types';

export const SET_REVIEWS = 'SET_REVIEWS';
export const RESET_REVIEWS = 'SET_REVIEWS';

export const loadPrcMembersIndividualReviews = (reviewId: number) => (dispatch: any, getState: any) => {
  const interventionId = getState().app.routeDetails.params.interventionId;
  return sendRequest({
    endpoint: getEndpoint(interventionEndpoints.officersReviews, {interventionId: interventionId, id: reviewId})
  })
    .then((reviews: any) => {
      dispatch({
        type: SET_REVIEWS,
        reviews: checkReviews(reviews)
      });
    })
    .catch((err: any) => {
      if (err.status === 404) {
        throw new Error('404');
      }
    });
};

function checkReviews(reviews: PrcOfficerReview[]) {
  return reviews.filter((review: PrcOfficerReview) => Boolean(review.review_date));
}
