import {createSelector} from 'reselect';
import {GenderEquityRating, GenderEquityRatingPermissions} from './genderEquityRating.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

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
