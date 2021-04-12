import {createSelector} from 'reselect';
import {NonFinancialContribution, NonFinancialContributionPermissions} from './nonFinancialContribution.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectNonFinancialContribution = createSelector(currentIntervention, (intervention: Intervention) => {
  return new NonFinancialContribution(intervention);
});

export const selectNonFinancialContributionPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new NonFinancialContributionPermissions(permissions!.edit),
      required: new NonFinancialContributionPermissions(permissions!.required)
    };
  }
);
