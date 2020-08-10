import {createSelector} from 'reselect';
import {Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {currentInterventionPermissions} from '../../common/selectors';
import {LocationsPermissions} from './geographicalCoverage.models';

export const selectLocationsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new LocationsPermissions(permissions!.edit),
      required: new LocationsPermissions(permissions!.required)
    };
  }
);
