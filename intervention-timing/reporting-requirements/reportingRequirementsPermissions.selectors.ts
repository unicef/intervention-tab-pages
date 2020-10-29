import {createSelector} from 'reselect';
import {ReportingRequirementsPermissions} from './reportingRequirementsPermissions.models';
import {currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields} from '@unicef-polymer/etools-types';

export const selectReportingRequirementsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new ReportingRequirementsPermissions(permissions!.edit),
      required: new ReportingRequirementsPermissions(permissions!.required)
    };
  }
);
