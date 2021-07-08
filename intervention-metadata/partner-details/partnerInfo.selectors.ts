import {createSelector} from 'reselect';
import {PartnerInfo, PartnerInfoPermissions} from './partnerInfo.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectPartnerDetails = createSelector(currentIntervention, (intervention: Intervention) => {
  return new PartnerInfo(intervention);
});

export const selectPartnerDetailsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new PartnerInfoPermissions(permissions!.edit),
      required: new PartnerInfoPermissions(permissions!.required),
      view: new PartnerInfoPermissions(permissions!.view!)
    };
  }
);
