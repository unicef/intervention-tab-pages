import {createSelector} from 'reselect';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {ProgrammeManagement, ProgrammeManagementActivityPermissions} from './effectiveEfficientProgrammeMgmt.models';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

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
