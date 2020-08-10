import {createSelector} from 'reselect';
import {Intervention, Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {PlannedVisits, PlannedVisitsPermissions} from './programmaticVisits.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';

export const selectPlannedVisits = createSelector(currentIntervention, (intervention: Intervention) => {
  return new PlannedVisits(intervention);
});

export const selectPlannedVisitsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new PlannedVisitsPermissions(permissions!.edit),
      required: new PlannedVisitsPermissions(permissions!.required)
    };
  }
);
