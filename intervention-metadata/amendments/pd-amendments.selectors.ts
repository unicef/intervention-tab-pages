import {createSelector} from 'reselect';
import {PdAmendmentPermissions} from './pd-amendments.models';
import {currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields} from '@unicef-polymer/etools-types';

export const selectAmendmentsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new PdAmendmentPermissions(permissions!.edit),
      required: new PdAmendmentPermissions(permissions!.required)
    };
  }
);
