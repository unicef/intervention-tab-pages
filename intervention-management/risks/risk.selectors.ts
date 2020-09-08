import {createSelector} from 'reselect';
import {Intervention, Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {RiskPermissions} from './risk.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';

export const selectRisks = createSelector(currentIntervention, (intervention: Intervention) => {
  return (intervention && intervention.risks) || [];
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
