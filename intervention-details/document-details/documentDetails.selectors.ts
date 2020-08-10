import {createSelector} from 'reselect';
import {Intervention, Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {DocumentDetails, DocumentDetailsPermissions} from './documentDetails.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';

export const selectDocumentDetails = createSelector(currentIntervention, (intervention: Intervention) => {
  return new DocumentDetails(intervention);
});

export const selectDocumentDetailsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new DocumentDetailsPermissions(permissions!.edit),
      required: new DocumentDetailsPermissions(permissions!.required)
    };
  }
);
