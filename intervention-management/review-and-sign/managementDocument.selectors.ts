import {createSelector} from 'reselect';
import {Intervention, Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {ReviewData, ReviewDataPermission} from './ManagementDocument.model';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';

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
