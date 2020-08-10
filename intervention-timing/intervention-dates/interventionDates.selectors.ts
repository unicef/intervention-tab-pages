import {createSelector} from 'reselect';
import {Intervention, Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {ProgrammeDocDates, InterventionDatesPermissions} from './interventionDates.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';

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
