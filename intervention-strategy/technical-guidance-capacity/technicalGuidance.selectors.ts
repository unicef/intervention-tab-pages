import {createSelector} from 'reselect';
import {TechnicalDetails, TechnicalDetailsPermissions} from './technicalGuidance.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

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
