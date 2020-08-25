import {createSelector} from 'reselect';
import {Intervention} from '../../common/models/intervention.types';
import {currentIntervention} from '../../common/selectors';

export const selectFinalReviewAttachment = createSelector(
  currentIntervention,
  (intervention: Intervention) => (intervention && intervention.final_partnership_review) || null
);

export const selectInterventionId = createSelector(
  currentIntervention,
  (intervention: Intervention) => (intervention && intervention.id) || null
);
