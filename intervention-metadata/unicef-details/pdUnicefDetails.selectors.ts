import {createSelector} from 'reselect';
import {PdUnicefDetails, PdUnicefDetailsPermissions} from './pdUnicefDetails.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectPdUnicefDetails = createSelector(currentIntervention, (intervention: Intervention) => {
  return new PdUnicefDetails(intervention);
});

export const selectPdUnicefDetailsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new PdUnicefDetailsPermissions(permissions!.edit),
      required: new PdUnicefDetailsPermissions(permissions!.required),
      view: new PdUnicefDetailsPermissions(permissions!.view!)
    };
  }
);
