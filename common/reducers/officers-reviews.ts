import {RESET_REVIEWS, SET_REVIEWS} from '../actions/officers-reviews';

export const prcIndividualReviews = (state = [], action: any) => {
  switch (action.type) {
    case SET_REVIEWS:
      return action.reviews;
    case RESET_REVIEWS:
      return [];
    default:
      return state;
  }
};
