import {sendRequest, EtoolsRequestConfig} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getStore} from './redux-store-access';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {showToast} from '../common/actions';

export const _sendRequest = (etoolsReqConfig: EtoolsRequestConfig, _requestKey?: string, _checkProgress?: boolean) => {
  return sendRequest(etoolsReqConfig, _requestKey, _checkProgress)
    .then((response: any) => response)
    .catch((error: any) => {
      if (error.status === 401) {
        // TODO
      }
      getStore().dispatch(showToast(formatServerErrorAsText(error)));
      throw error;
    });
};
