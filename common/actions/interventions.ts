import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {INTERVENTION_LOADING, SHOULD_REGET_LIST, SHOW_TOAST, UPDATE_CURRENT_INTERVENTION} from '../actionsConstants';
import {AnyObject, PlannedBudget, Intervention} from '@unicef-polymer/etools-types';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {PartnerReportingRequirements} from '../types/store.types';
import pick from 'lodash-es/pick';
import {isJsonStrMatch} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {_sendRequest} from '@unicef-polymer/etools-modules-common/dist/utils/request-helper';

export const updateCurrentIntervention = (intervention: AnyObject | null) => {
  if (intervention && !intervention.planned_budget) {
    intervention.planned_budget = new PlannedBudget();
  }
  return {
    type: UPDATE_CURRENT_INTERVENTION,
    current: intervention
  };
};

export const setInterventionLoading = (loadingState: number | null) => {
  return {
    type: INTERVENTION_LOADING,
    loadingState: loadingState
  };
};

export const setShouldReGetList = (reGet: boolean) => {
  return {
    type: SHOULD_REGET_LIST,
    shouldReGetList: reGet
  };
};

export const getIntervention = (interventionId?: string) => (dispatch: any, getState: any) => {
  if (!interventionId) {
    interventionId = getState().app.routeDetails.params.interventionId;
  }
  dispatch(setInterventionLoading(Number(interventionId)));
  return sendRequest({
    endpoint: getEndpoint(interventionEndpoints.intervention, {interventionId: interventionId})
  })
    .then((intervention: Intervention) => {
      dispatch(updateCurrentIntervention(intervention));
    })
    .catch((err: any) => {
      if (err.status === 404) {
        throw new Error('404');
      }
    })
    .finally(() => dispatch(setInterventionLoading(null)));
};

export const showToast = (message: string, showCloseBtn = true) => {
  return {
    type: SHOW_TOAST,
    message,
    showCloseBtn
  };
};

export const setPrpCountries = (PRPCountryData: AnyObject[]) => {
  return {
    type: 'UPDATE_PRP_COUNTRIES',
    PRPCountryData
  };
};

export const patchIntervention =
  (interventionChunck: any, interventionId?: string) => (dispatch: any, getState: any) => {
    if (!interventionId) {
      interventionId = getState().app.routeDetails.params.interventionId;
    }
    const prevInterventionState = getState().interventions?.current;
    return _sendRequest({
      endpoint: getEndpoint(interventionEndpoints.intervention, {interventionId: interventionId}),
      body: interventionChunck,
      method: 'PATCH'
    }).then((intervention: Intervention) => {
      dispatch(updateCurrentIntervention(intervention));

      if (shouldReGetList(prevInterventionState, intervention)) {
        dispatch(setShouldReGetList(true));
      }
    });
  };

function shouldReGetList(prevInterventionState: Intervention, currentInterventionState: Intervention) {
  const fieldsDisplayedOnList = [
    'number',
    'partner_name',
    'document_type',
    'status',
    'offices',
    'title',
    'start',
    'end',
    'sections',
    'planned_budget',
    'partner_accepted',
    'unicef_accepted',
    'unicef_court',
    'date_sent_to_partner',
    'result_links',
    'planned_budget',
    'frs',
    'frs_details'
  ];
  const prevI = pick(prevInterventionState, fieldsDisplayedOnList);
  const currentI = pick(currentInterventionState, fieldsDisplayedOnList);
  return !isJsonStrMatch(prevI, currentI);
}

export const updatePartnerReportingRequirements = (newReportingRequirements: PartnerReportingRequirements) => {
  return {
    type: 'UPDATE_PARTNER_REPORTING_REQUIREMENTS',
    partnerReportingRequirements: newReportingRequirements
  };
};
