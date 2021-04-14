import {createSelector} from 'reselect';
import {PrcDocumentData, PrcDocumentPermissions} from './prcDocument.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectPrcDocumentData = createSelector(currentIntervention, (intervention: Intervention) => {
  return new PrcDocumentData(intervention);
});

export const selectPrcDocumentPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new PrcDocumentPermissions(permissions!.edit),
      required: new PrcDocumentPermissions(permissions!.required)
    };
  }
);
