import {sendRequest, EtoolsRequestConfig} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {fireEvent} from './fire-custom-event';

export const _sendRequest = (etoolsReqConfig: EtoolsRequestConfig, _requestKey?: string) => {
  return sendRequest(etoolsReqConfig, _requestKey)
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
