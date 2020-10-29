import {createSelector} from 'reselect';
import {TimingOverviewData} from './timingOverview.models';
import {currentIntervention} from '../../common/selectors';
import {Intervention} from '@unicef-polymer/etools-types';

export const selectTimingOverview = createSelector(currentIntervention, (intervention: Intervention) => {
  return new TimingOverviewData(intervention);
});
