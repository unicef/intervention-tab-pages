import {createSelector} from 'reselect';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {ReviewData, ReviewDataPermission} from './managementDocument.model';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectReviewData = createSelector(currentIntervention, (intervention: Intervention) => {
  return new ReviewData(intervention);
});

export const selectReviewDataPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new ReviewDataPermission(permissions!.edit),
      required: new ReviewDataPermission(permissions!.required)
    };
  }
);
