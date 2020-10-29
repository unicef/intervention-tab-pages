import {createSelector} from 'reselect';
import {DocumentDetails, DocumentDetailsPermissions} from './documentDetails.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

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
