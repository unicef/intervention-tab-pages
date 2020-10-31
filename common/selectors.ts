import {createSelector} from 'reselect';
import {Intervention} from '@unicef-polymer/etools-types';

export const currentSubpage = (state: any) => state.app!.routeDetails?.subRouteName;
export const currentPage = (state: any) => state.app!.routeDetails?.routeName;
export const currentIntervention = (state: any) => state.interventions?.current;
export const currentInterventionPermissions = (state: any) => state.interventions.current.permissions;
export const currentInterventionPlannedBudget = (state: any) => state.interventions.current.planned_budget;
export const isUnicefUser = (state: any) => state.user?.data?.is_unicef_user;

export const selectAvailableActions = createSelector(
  currentIntervention,
  (intervention: Intervention) => (intervention && intervention.available_actions) || []
);
