import {createSelector} from 'reselect';
import {
  CapacityStrengtheningCostsData,
  CapacityStrengtheningCostsPermissions
} from './capacityStrengtheningCosts.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectCapacityStrengtheningCostsData = createSelector(
  currentIntervention,
  (intervention: Intervention) => {
    return new CapacityStrengtheningCostsData(intervention);
  }
);

export const selectCapacityStrengtheningCostsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new CapacityStrengtheningCostsPermissions(permissions!.edit),
      required: new CapacityStrengtheningCostsPermissions(permissions!.required)
    };
  }
);
