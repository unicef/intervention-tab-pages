import {_sendRequest} from '../../utils/request-helper';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {SHOW_TOAST} from '../actionsConstants';
import {AnyObject, PlannedBudget, Intervention} from '@unicef-polymer/etools-types';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {PartnerReportingRequirements} from '../types/store.types';

export const updateCurrentIntervention = (intervention: AnyObject | null) => {
  if (intervention && !intervention.planned_budget) {
    intervention.planned_budget = new PlannedBudget();
  }
  return {
    type: 'UPDATE_CURRENT_INTERVENTION',
    current: intervention
  };
};

export const getIntervention = (interventionId?: string) => (dispatch: any, getState: any) => {
  if (!interventionId) {
    interventionId = getState().app.routeDetails.params.interventionId;
  }
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
    });
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

export const patchIntervention = (interventionChunck: any, interventionId?: string) => (
  dispatch: any,
  getState: any
) => {
  if (!interventionId) {
    interventionId = getState().app.routeDetails.params.interventionId;
  }
  return _sendRequest({
    endpoint: getEndpoint(interventionEndpoints.intervention, {interventionId: interventionId}),
    body: interventionChunck,
    method: 'PATCH'
  }).then((intervention: Intervention) => {
    dispatch(updateCurrentIntervention(intervention));
  });
};

export const updatePartnerReportingRequirements = (newReportingRequirements: PartnerReportingRequirements) => {
  return {
    type: 'UPDATE_PARTNER_REPORTING_REQUIREMENTS',
    partnerReportingRequirements: newReportingRequirements
  };
};
