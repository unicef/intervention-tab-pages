import {createSelector} from 'reselect';
import {Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {ReportingRequirementsPermissions} from './reportingRequirementsPermissions.models';
import {currentInterventionPermissions} from '../../common/selectors';

export const selectReportingRequirementsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new ReportingRequirementsPermissions(permissions!.edit),
      required: new ReportingRequirementsPermissions(permissions!.required)
    };
  }
);
