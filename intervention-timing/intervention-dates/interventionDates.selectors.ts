import {createSelector} from 'reselect';
import {ProgrammeDocDates, InterventionDatesPermissions} from './interventionDates.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {Intervention, InterventionPermissionsFields} from '@unicef-polymer/etools-types';

export const selectInterventionDates = createSelector(currentIntervention, (intervention: Intervention) => {
  return new ProgrammeDocDates(intervention);
});

export const selectInterventionDatesPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new InterventionDatesPermissions(permissions!.edit),
      required: new InterventionDatesPermissions(permissions!.required)
    };
  }
);
