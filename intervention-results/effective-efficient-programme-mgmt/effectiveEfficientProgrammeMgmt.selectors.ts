import {createSelector} from 'reselect';
import {Intervention, Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {
  ProgrammeManagement,
  ProgrammeManagementActivityPermissions
} from './effectiveEfficientProgrammeMgmt.models';

export const selectProgrammeManagement = createSelector(currentIntervention, (intervention: Intervention) => {
  return new ProgrammeManagement(intervention);
});

export const selectProgrammeManagementActivityPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new ProgrammeManagementActivityPermissions(permissions!.edit),
      required: new ProgrammeManagementActivityPermissions(permissions!.required)
    };
  }
);
