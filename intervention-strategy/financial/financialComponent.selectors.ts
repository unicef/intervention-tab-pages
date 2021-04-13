import {createSelector} from 'reselect';
import {FinancialComponentData, FinancialComponentPermissions} from './financialComponent.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

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
