import {createSelector} from 'reselect';
import {currentIntervention} from '../../common/selectors';
import {Intervention} from '@unicef-polymer/etools-types';

export const selectInterventionResultLinks = createSelector(currentIntervention, (intervention: Intervention) => {
  return (intervention && intervention.result_links) || null;
});

export const selectInterventionId = createSelector(currentIntervention, (intervention: Intervention) => {
  return (intervention && intervention.id) || null;
});

export const selectInterventionStatus = createSelector(currentIntervention, (intervention: Intervention) => {
  return (intervention && intervention.status) || '';
});

export const selectInterventionQuarters = createSelector(currentIntervention, (intervention: Intervention) => {
  return (intervention && intervention.quarters) || [];
});

export const selectResultLinksPermissions = createSelector(currentIntervention, (intervention: Intervention) => {
  const permissions = intervention && intervention.permissions;
  return {
    edit: {result_links: permissions?.edit.result_links},
    required: {result_links: permissions?.required.result_links}
  };
});
