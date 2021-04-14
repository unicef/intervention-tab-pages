import {createSelector} from 'reselect';
import {OtherData, OtherPermissions} from './other.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectOtherData = createSelector(currentIntervention, (intervention: Intervention) => {
  return new OtherData(intervention);
});

export const selectOtherPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new OtherPermissions(permissions!.edit),
      required: new OtherPermissions(permissions!.required)
    };
  }
);
