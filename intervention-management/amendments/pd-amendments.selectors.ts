import {createSelector} from 'reselect';
import {Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {PdAmendmentPermissions} from './pd-amendments.models';
import {currentInterventionPermissions} from '../../common/selectors';

export const selectAmendmentsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new PdAmendmentPermissions(permissions!.edit),
      required: new PdAmendmentPermissions(permissions!.required)
    };
  }
);
