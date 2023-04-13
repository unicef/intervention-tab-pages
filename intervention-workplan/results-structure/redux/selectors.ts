import {createSelector} from 'reselect';
import {Disaggregation} from '@unicef-polymer/etools-types';
import {get as getTranslation} from 'lit-translate';

const disaggregationsSelector = (state: any) => state.commonData!.disaggregations;

export const flaggedSortedDisaggregs = createSelector(disaggregationsSelector, (disagregs: Disaggregation[]) => {
  if (!disagregs || !disagregs.length) {
    return [];
  }

  return [...disagregs]
    .map((d: Disaggregation) => {
      if (!d.active) {
        d.name = `(*${getTranslation('INACTIVE')}) ` + d.name;
      }
      return d;
    })
    .sort((d1: Disaggregation, d2: Disaggregation) => {
      if (d1.active === d2.active) {
        return 0;
      }
      if (d1.active) {
        return -1;
      }
      return 1;
    });
});
