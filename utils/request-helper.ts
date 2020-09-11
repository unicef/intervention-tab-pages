import {sendRequest, EtoolsRequestConfig} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {fireEvent} from '../../../../utils/fire-custom-event';

export const _sendRequest = (etoolsReqConfig: EtoolsRequestConfig, _requestKey?: string, _checkProgress?: boolean) => {
  return sendRequest(etoolsReqConfig, _requestKey, _checkProgress)
    .then((response: any) => response)
    .catch((error: any) => {
      if (error.status === 401) {
        // TODO
      }
      fireEvent(document.body, 'toast', {
        text: formatServerErrorAsText(error),
        showCloseBtn: true
      });
      throw error;
    });
};
