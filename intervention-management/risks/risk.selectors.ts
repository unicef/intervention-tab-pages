import {createSelector} from 'reselect';
import {currentIntervention} from '../../common/selectors';
import {Intervention} from '@unicef-polymer/etools-types';

export const selectRisks = createSelector(currentIntervention, (intervention: Intervention) => {
  return (intervention && intervention.risks) || [];
});
