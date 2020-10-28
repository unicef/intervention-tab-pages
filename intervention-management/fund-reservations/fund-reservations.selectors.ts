import {createSelector} from 'reselect';
import {currentInterventionPermissions} from '../../common/selectors';
import {FundReservationsPermissions} from './fund-reservations.models';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields} from '@unicef-polymer/etools-types';

export const selectFundReservationPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new FundReservationsPermissions(permissions!.edit),
      required: new FundReservationsPermissions(permissions!.required)
    };
  }
);
