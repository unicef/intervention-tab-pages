import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {isJsonStrMatch} from '../../../utils/utils';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {Constructor, User, AnyObject} from '../../../common/models/globals.types';
import {EtoolsEndpoint} from '../../../utils/intervention-endpoints';

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

    tokenStorageKeys = {
      prp: 'etoolsPrpToken'
    };

    getTokenEndpoints = {
      prp: 'prpToken'
    };

    PROD_DOMAIN = 'etools.unicef.org';
    STAGING_DOMAIN = 'etools-staging.unicef.org';
    DEV_DOMAIN = 'etools-dev.unicef.org';
    DEMO_DOMAIN = 'etools-demo.unicef.org';
    LOCAL_DOMAIN = 'localhost:8082';

    public _checkEnvironment() {
      const location = window.location.href;
      if (location.indexOf(this.STAGING_DOMAIN) > -1) {
        return 'STAGING';
      }
      if (location.indexOf(this.DEMO_DOMAIN) > -1) {
        return 'DEMO';
      }
      if (location.indexOf(this.DEV_DOMAIN) > -1) {
        return 'DEVELOPMENT';
      }
      if (location.indexOf(this.LOCAL_DOMAIN) > -1) {
        return 'LOCAL';
      }
      return null;
    }

    public tokenEndpointsHost(host: string) {
      if (host === 'prp') {
        switch (this._checkEnvironment()) {
          case 'LOCAL':
            return 'http://127.0.0.1:8081';
          case 'DEVELOPMENT':
            return 'https://dev.partnerreportingportal.org';
          case 'DEMO':
            return 'https://demo.partnerreportingportal.org';
          case 'STAGING':
            return 'https://staging.partnerreportingportal.org';
          case null:
            return 'https://www.partnerreportingportal.org';
          default:
            return 'https://dev.partnerreportingportal.org';
        }
      }
      return null;
    }

    public endStateChanged(state: any) {
      if (!isJsonStrMatch(state.commonData!.PRPCountryData, this.prpCountries)) {
        this.prpCountries = [...state.commonData!.PRPCountryData];
      }
      if (!isJsonStrMatch(state.commonData!.currentUser, this.currentUser)) {
        this.currentUser = JSON.parse(JSON.stringify(state.commonData!.currentUser));
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

    public getEndpoint(endpoint: EtoolsEndpoint, data?: AnyObject) {
      // const endpoint = JSON.parse(JSON.stringify((pmpEndpoints as any)[endpointName]));
      const authorizationTokenMustBeAdded = this.authorizationTokenMustBeAdded(endpoint);
      const baseSite = authorizationTokenMustBeAdded ? this.tokenEndpointsHost(endpoint.token) : window.location.origin;

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

    protected _hasUrlTemplate(endpoint: EtoolsEndpoint) {
      return (
        endpoint && Object.prototype.hasOwnProperty.call(endpoint, 'template') && (endpoint as any).template !== ''
      );
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

    public authorizationTokenMustBeAdded(endpoint: EtoolsEndpoint): boolean {
      return endpoint && 'token' in endpoint;
    }

    public getCurrentToken(tokenKey: string) {
      return localStorage.getItem((this.tokenStorageKeys as any)[tokenKey]);
    }

    public storeToken(tokenKey: string, tokenBase64Encoded: string) {
      localStorage.setItem((this.tokenStorageKeys as any)[tokenKey], tokenBase64Encoded);
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
      return (this.getTokenEndpoints as any)[tokenKey];
    }

    public addTokenToRequestOptions(endpointName: EtoolsEndpoint, data: AnyObject) {
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
      endpoint: EtoolsEndpoint,
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
