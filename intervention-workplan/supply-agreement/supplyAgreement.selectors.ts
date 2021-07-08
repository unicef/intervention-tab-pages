import {createSelector} from 'reselect';
import {currentIntervention} from '../../common/selectors';
import {Intervention} from '@unicef-polymer/etools-types';

export const selectSupplyAgreement = createSelector(currentIntervention, (intervention: Intervention) => {
  return (intervention && intervention.supply_items) || [];
});

export const selectSupplyAgreementPermissions = createSelector(currentIntervention, (intervention: Intervention) => {
  const permissions = intervention && intervention.permissions;
  return {
    edit: {supply_items: permissions?.edit.supply_items}
  };
});
