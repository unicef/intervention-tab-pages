import {createSelector} from 'reselect';
import {HqContributionData, HqContributionPermissions} from './hqContribution.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectHqContributionData = createSelector(currentIntervention, (intervention: Intervention) => {
  return new HqContributionData(intervention);
});

export const selectHqContributionPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new HqContributionPermissions(permissions!.edit),
      required: new HqContributionPermissions(permissions!.required)
    };
  }
);
