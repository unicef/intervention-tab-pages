import {createSelector} from 'reselect';
import {currentIntervention} from '../../common/selectors';
import {Intervention} from '@unicef-polymer/etools-types';

export const selectFinalReviewAttachment = createSelector(
  currentIntervention,
  (intervention: Intervention) => (intervention && intervention.final_partnership_review) || null
);

export const selectInterventionId = createSelector(
  currentIntervention,
  (intervention: Intervention) => (intervention && intervention.id) || null
);
