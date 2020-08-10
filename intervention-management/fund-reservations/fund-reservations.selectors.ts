import {createSelector} from 'reselect';
import {Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {currentInterventionPermissions} from '../../common/selectors';
import {FundReservationsPermissions} from './fund-reservations.models';

export const selectFundReservationPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new FundReservationsPermissions(permissions!.edit),
      required: new FundReservationsPermissions(permissions!.required)
    };
  }
);
