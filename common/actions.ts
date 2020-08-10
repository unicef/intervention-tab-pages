import {_sendRequest} from '../utils/request-helper';
import {getEndpoint} from '../utils/endpoint-helper';
import {interventionEndpoints} from '../utils/intervention-endpoints';
import {Intervention} from './models/intervention.types';
import {SHOW_TOAST} from './actionsConstants';
import {AnyObject} from './models/globals.types';

export const updateCurrentIntervention = (intervention: AnyObject) => {
  return {
    type: 'UPDATE_CURRENT_INTERVENTION',
    current: intervention
  };
};

export const getIntervention = (interventionId: string) => (dispatch: any) => {
  return _sendRequest({
    endpoint: getEndpoint(interventionEndpoints.intervention, {interventionId: interventionId})
  }).then((intervention: Intervention) => {
    dispatch(updateCurrentIntervention(intervention));
  });
};

export const showToast = (message: string, showCloseBtn = true) => {
  return {
    type: SHOW_TOAST,
    message,
    showCloseBtn
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
    dispatch({
      type: 'UPDATE_CURRENT_INTERVENTION',
      current: intervention
    });
  });
};
