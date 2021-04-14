import {createSelector} from 'reselect';
import {PlannedVisits, PlannedVisitsPermissions} from './programmaticVisits.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

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
