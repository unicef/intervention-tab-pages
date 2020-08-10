import {createSelector} from 'reselect';
import {currentIntervention} from '../../common/selectors';
import {Intervention} from '../../common/models/intervention.types';

export const selectInterventionResultLinks = createSelector(currentIntervention, (intervention: Intervention) => {
  return (intervention && intervention.result_links) || null;
});

export const selectInterventionId = createSelector(currentIntervention, (intervention: Intervention) => {
  return (intervention && intervention.id) || null;
});

export const selectInterventionQuarters = createSelector(currentIntervention, (intervention: Intervention) => {
  return (intervention && intervention.quarters) || [];
});
