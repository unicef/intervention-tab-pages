import {createSelector} from 'reselect';
import {PartnerInfo, PartnerInfoPermissions} from './partnerInfo.models';
import {Intervention, Permission, InterventionPermissionsFields} from '../../common/models/intervention.types';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';

export const selectPartnerDetails = createSelector(currentIntervention, (intervention: Intervention) => {
  return new PartnerInfo(intervention);
});

export const selectPartnerDetailsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new PartnerInfoPermissions(permissions!.edit),
      required: new PartnerInfoPermissions(permissions!.required)
    };
  }
);
