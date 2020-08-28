import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {isJsonStrMatch} from '../../utils/utils';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {Constructor, User, AnyObject, RootState} from '../../common/models/globals.types';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {tokenEndpointsHost, tokenStorageKeys, getTokenEndpoints} from '../../config/config';

/**
 * @polymer
 * @mixinFunction
 */
function EndpointsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class EndpointsMixinClass extends (baseClass as Constructor<PolymerElement>) {
    @property({type: Object})
    prpCountries!: AnyObject[];

    @property({type: Object})
    currentUser!: User;

    public endStateChanged(state: RootState) {
      if (!isJsonStrMatch(state.commonData!.PRPCountryData!, this.prpCountries)) {
        this.prpCountries = [...state.commonData!.PRPCountryData!];
      }
      if (!isJsonStrMatch(state.user, this.currentUser)) {
        this.currentUser = JSON.parse(JSON.stringify(state.user));
      }
    }

    protected _getPrpCountryId() {
      const currentCountry = this.currentUser.countries_available.find((country: AnyObject) => {
        return (country as any).id === this.currentUser.country.id;
      });
      const prpCountry = this.prpCountries.find((prpCountry: AnyObject) => {
        return (prpCountry as any).business_area_code === currentCountry!.business_area_code;
      });

      if (!prpCountry) {
        const countryNotFoundInPrpWarning =
          'Error: ' +
          this.currentUser.country.name +
          ' country data was ' +
          'not found in the available PRP countries by business_area_code!';
        throw new Error(countryNotFoundInPrpWarning);
      }

      return prpCountry.id;
    }

    protected _urlTemplateHasCountryId(template: string): boolean {
      return template.indexOf('<%=countryId%>') > -1;
    }

    public getEndpoint(endpointName: string, data?: AnyObject) {
      const endpoint = JSON.parse(JSON.stringify((interventionEndpoints as any)[endpointName]));
      const authorizationTokenMustBeAdded = this.authorizationTokenMustBeAdded(endpoint);
      const baseSite = authorizationTokenMustBeAdded ? tokenEndpointsHost(endpoint.token) : window.location.origin;

      if (this._hasUrlTemplate(endpoint)) {
        if (data && authorizationTokenMustBeAdded && this._urlTemplateHasCountryId(endpoint.template!)) {
          // we need to get corresponding PRP country ID
          (data as any).countryId = this._getPrpCountryId();
        }
        endpoint.url = baseSite + this._generateUrlFromTemplate(endpoint.template!, data);
      } else {
        if (endpoint.url!.indexOf(baseSite!) === -1) {
          endpoint.url = baseSite + endpoint.url!;
        }
      }

      return endpoint;
    }

    protected _generateUrlFromTemplate(tmpl: string, data: AnyObject | undefined) {
      if (!tmpl) {
        throw new Error('To generate URL from endpoint url template you need valid template string');
      }

      if (data && Object.keys(data).length > 0) {
        for (const k in data) {
          if (Object.prototype.hasOwnProperty.call(data, k)) {
            const replacePattern = new RegExp('<%=' + k + '%>', 'gi');
            tmpl = tmpl.replace(replacePattern, (data as any)[k]);
          }
        }
      }

      return tmpl;
    }

    protected _hasUrlTemplate(endpoint: AnyObject) {
      return endpoint && endpoint.template;
    }

    protected _getDeferrer() {
      // create defer object (utils behavior contains to many other unneeded methods to be used)
      const defer: any = {};
      defer.promise = new Promise(function (resolve, reject) {
        defer.resolve = resolve;
        defer.reject = reject;
      });
      return defer;
    }

    public authorizationTokenMustBeAdded(endpoint: AnyObject): boolean {
      return endpoint && endpoint.token;
    }

    public getCurrentToken(tokenKey: string) {
      return localStorage.getItem((tokenStorageKeys as AnyObject)[tokenKey]);
    }

    public storeToken(tokenKey: string, tokenBase64Encoded: string) {
      localStorage.setItem((tokenStorageKeys as AnyObject)[tokenKey], tokenBase64Encoded);
    }

    public decodeBase64Token(encodedToken: string) {
      const base64Url = encodedToken.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64));
    }

    public tokenIsValid(token: string) {
      const decodedToken = this.decodeBase64Token(token);
      return Date.now() < decodedToken.exp;
    }

    public getAuthorizationHeader(token: string) {
      return {Authorization: 'JWT ' + token};
    }

    public requestToken(endpoint: EtoolsRequestEndpoint) {
      return sendRequest({
        endpoint: endpoint
      });
    }

    protected _buildOptionsWithTokenHeader(options: any, token: string) {
      options.headers = this.getAuthorizationHeader(token);
      delete options.endpoint.token; // cleanup token from endpoint object
      return options;
    }

    public getTokenEndpointName(tokenKey: string) {
      return (getTokenEndpoints as AnyObject)[tokenKey];
    }

    public addTokenToRequestOptions(endpointName: string, data: AnyObject) {
      let options: any = {};
      try {
        options.endpoint = this.getEndpoint(endpointName, data);
      } catch (e) {
        return Promise.reject(e);
      }

      // create defer object (utils behavior contains to many other unneeded methods to be used)
      const defer = this._getDeferrer();

      if (this.authorizationTokenMustBeAdded(options.endpoint)) {
        const tokenKey = options.endpoint.token;
        const token = this.getCurrentToken(tokenKey);
        // because we could have other tokens too
        if (token && this.tokenIsValid(token)) {
          // token exists and it's still valid
          options = this._buildOptionsWithTokenHeader(options, token);
          defer.resolve(options);
        } else {
          // request new token
          const tokenEndpointName = this.getTokenEndpointName(tokenKey);
          this.requestToken(this.getEndpoint(tokenEndpointName))
            .then((response: any) => {
              this.storeToken(options.endpoint.token, response.token);
              options = this._buildOptionsWithTokenHeader(options, response.token);
              defer.resolve(options);
            })
            .catch((error: any) => {
              // request for getting a new token failed
              defer.reject(error);
            });
        }
      } else {
        defer.resolve(options);
      }
      return defer.promise;
    }

    protected _addAdditionalRequestOptions(options: any, requestAdditionalOptions: any) {
      if (requestAdditionalOptions) {
        Object.keys(requestAdditionalOptions).forEach(function (key) {
          switch (key) {
            case 'endpoint':
              break;
            case 'headers':
              // add additional headers
              options.headers = Object.assign({}, options.headers, requestAdditionalOptions[key]);
              break;
            default:
              options[key] = requestAdditionalOptions[key];
          }
        });
      }
      return options;
    }

    public fireRequest(
      endpoint: any,
      endpointTemplateData: AnyObject,
      requestAdditionalOptions?: AnyObject,
      activeReqKey?: string
    ) {
      if (!endpoint) {
        logError('Endpoint name is missing.', 'Endpoints:fireRequest');
        return;
      }
      const defer = this._getDeferrer();
      this.addTokenToRequestOptions(endpoint, endpointTemplateData)
        .then((requestOptions: any) => {
          const options = this._addAdditionalRequestOptions(requestOptions, requestAdditionalOptions);
          return sendRequest(options, activeReqKey);
        })
        .then((endpointResponse: any) => {
          defer.resolve(endpointResponse);
        })
        .catch((error: any) => {
          defer.reject(error);
        });
      return defer.promise;
    }
  }
  return EndpointsMixinClass;
}

export default EndpointsMixin;
