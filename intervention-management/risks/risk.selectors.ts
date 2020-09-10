import {createSelector} from 'reselect';
import {Intervention} from '../../common/models/intervention.types';
import {currentIntervention} from '../../common/selectors';

export const selectRisks = createSelector(currentIntervention, (intervention: Intervention) => {
  return (intervention && intervention.risks) || [];
});
