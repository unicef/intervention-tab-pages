import {createSelector} from 'reselect';
import {currentIntervention, currentInterventionPermissions} from './selectors';
import {ReviewData, ReviewDataPermission} from '../intervention-metadata/review-and-sign/managementDocument.model';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectReviewData = createSelector(currentIntervention, (intervention: Intervention) => {
  return new ReviewData(intervention);
});

export const selectDatesAndSignaturesPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new ReviewDataPermission(permissions!.edit),
      required: new ReviewDataPermission(permissions!.required),
      view: new ReviewDataPermission(permissions!.view!)
    };
  }
);
