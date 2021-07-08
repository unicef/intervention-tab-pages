export const currentSubpage = (state: any) => state.app!.routeDetails?.subRouteName;
export const currentSubSubpage = (state: any) => state.app!.routeDetails?.subSubRouteName;
export const currentPage = (state: any) => state.app!.routeDetails?.routeName;
export const currentIntervention = (state: any) => state.interventions?.current;
export const currentInterventionPermissions = (state: any) => state.interventions.current?.permissions;
export const currentInterventionPlannedBudget = (state: any) => state.interventions.current?.planned_budget;
export const isUnicefUser = (state: any) => state.user?.data?.is_unicef_user;
export const currentUser = (state: any) => state.user?.data;
export const allPartners = (state: any) => state.commonData?.partners || state.partners?.list || [];
