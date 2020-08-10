import {createSelector} from 'reselect';
import {Intervention, Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {GenderEquityRating, GenderEquityRatingPermissions} from './genderEquityRating.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';

export const selectGenderEquityRating = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GenderEquityRating(intervention);
});

export const selectGenderEquityRatingPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new GenderEquityRatingPermissions(permissions!.edit),
      required: new GenderEquityRatingPermissions(permissions!.required)
    };
  }
);
