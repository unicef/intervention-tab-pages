import {createSelector} from 'reselect';
import {Intervention, Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {TechnicalDetails, TechnicalDetailsPermissions} from './technicalGuidance.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';

export const selectTechnicalDetails = createSelector(currentIntervention, (intervention: Intervention) => {
  return new TechnicalDetails(intervention);
});

export const selectTechnicalDetailsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new TechnicalDetailsPermissions(permissions!.edit),
      required: new TechnicalDetailsPermissions(permissions!.required)
    };
  }
);
