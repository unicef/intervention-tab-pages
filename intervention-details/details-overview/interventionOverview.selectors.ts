import {createSelector} from 'reselect';
import {Intervention} from '../../common/models/intervention.types';
import {InterventionOverview} from './interventionOverview.models';
import {currentIntervention} from '../../common/selectors';

export const selectInterventionOverview = createSelector(currentIntervention, (intervention: Intervention) => {
  return new InterventionOverview(intervention);
});
