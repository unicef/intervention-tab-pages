import {AsyncAction, Constructor} from '@unicef-polymer/etools-types/dist/global.types';
import {LitElement} from 'lit-element';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getIntervention} from '../actions/interventions';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';

export function ActivitiesActionsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ActivitiesActionsClass extends baseClass {
    deactivateActivity(activityId: number, pdOutputId: number, interventionId: number) {
      const endpoint = getEndpoint(interventionEndpoints.pdActivityDetails, {
        activityId: activityId,
        interventionId: interventionId,
        pdOutputId: pdOutputId
      });
      sendRequest({
        method: 'PATCH',
        endpoint: endpoint,
        body: {
          is_active: false
        }
      })
        .then(() => {
          getStore().dispatch<AsyncAction>(getIntervention());
        })
        .catch((err: any) => {
          fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
        });
    }

    deleteActivity(activityId: string, pdOutputId: number, interventionId: number) {
      const endpoint = getEndpoint(interventionEndpoints.pdActivityDetails, {
        activityId: activityId,
        interventionId: interventionId,
        pdOutputId: pdOutputId
      });
      sendRequest({
        method: 'DELETE',
        endpoint: endpoint
      })
        .then(() => {
          getStore().dispatch<AsyncAction>(getIntervention());
        })
        .catch((err: any) => {
          fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
        });
    }
  };
}
