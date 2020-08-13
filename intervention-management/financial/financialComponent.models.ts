import {createSelector} from 'reselect';
import {Intervention, Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {FinancialComponentData, FinancialComponentPermissions} from './financialComponent.selectors';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';

export const selectFinancialComponent = createSelector(currentIntervention, (intervention: Intervention) => {
  return new FinancialComponentData(intervention);
});

export const selectFinancialComponentPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new FinancialComponentPermissions(permissions!.edit),
      required: new FinancialComponentPermissions(permissions!.required)
    };
  }
);
