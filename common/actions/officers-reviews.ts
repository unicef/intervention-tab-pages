import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

export const SET_REVIEWS = 'SET_REVIEWS';
export const RESET_REVIEWS = 'SET_REVIEWS';

export const loadReviews = (reviewId: number) => (dispatch: any, getState: any) => {
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

function checkReviews(reviews: any) {
  return reviews.filter((review) => Boolean(review.started_date || review.submitted_date));
}
