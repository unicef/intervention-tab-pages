import {createSelector} from 'reselect';
import {Intervention} from '../../common/models/intervention.types';
import {TimingOverviewData} from './timingOverview.models';
import {currentIntervention} from '../../common/selectors';

export const selectTimingOverview = createSelector(currentIntervention, (intervention: Intervention) => {
  return new TimingOverviewData(intervention);
});
