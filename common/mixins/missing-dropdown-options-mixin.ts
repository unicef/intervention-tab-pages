import {getEndpoint} from '../../utils/endpoint-helper';
import {logError, logWarn} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {Constructor} from '../models/globals.types';
import {LitElement} from 'lit-element';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
function MissingDropdownOptionsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class MissingDropdownOptionsClass extends baseClass {
    public setDropdownMissingOptionsAjaxDetails(dropdownEl: any, endpointName: any, params: any) {
      setTimeout(() => {
        try {
          if (dropdownEl) {
            const endpointUrl = this.getMissingOptionsEndpointUrl(endpointName);
            params = params ? params : {};

            dropdownEl.set('ajaxParams', params);
            dropdownEl.set('url', endpointUrl);
          } else {
            logWarn('Esmm element is null and the endpoint ' + endpointName + ' url can not be assigned to it!');
          }
        } catch (err) {
          logError('An error occurred at ghost data esmm setup.', err);
        }
      });
    }

    public getMissingOptionsEndpointUrl(endpointName: any) {
      const endpoint = getEndpoint(endpointName);
      if (endpoint && endpoint.url) {
        return endpoint.url;
      }
      return null;
    }

    public getCleanEsmmOptions(options: any) {
      return options instanceof Array ? options.slice(0) : [];
    }
  }
  return MissingDropdownOptionsClass;
}

export default MissingDropdownOptionsMixin;
