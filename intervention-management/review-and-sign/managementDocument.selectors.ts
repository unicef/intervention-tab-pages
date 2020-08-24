import {createSelector} from 'reselect';
import {Intervention, Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {ReviewData, ReviewDataPermission} from './managementDocument.model';

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
