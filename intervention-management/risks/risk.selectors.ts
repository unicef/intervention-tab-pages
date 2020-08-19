import {createSelector} from 'reselect';
import {Intervention, Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {Risk, RiskPermissions} from './risk.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';

export const selectRisks = createSelector(currentIntervention, (intervention: Intervention) => {
  return new Risk(intervention);
});

export const selectRiskPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new RiskPermissions(permissions!.edit),
      required: new RiskPermissions(permissions!.required)
    };
  }
);
