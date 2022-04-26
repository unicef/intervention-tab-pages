import {LitElement, customElement} from 'lit-element';
// eslint-disable-next-line max-len
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {setPrpCountries} from '../../actions/interventions';
import get from 'lodash-es/get';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';

@customElement('prp-country-data')
export class PrpCountryData extends EndpointsLitMixin(LitElement) {
  getPRPCountries() {
    if (!(get(getStore().getState(), 'commonData.PRPCountryData') || []).length) {
      this.fireRequest(interventionEndpoints, 'getPRPCountries', {}).then((prpCountries: any[]) => {
        getStore().dispatch(setPrpCountries(prpCountries));
      });
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.getPRPCountries();
  }
}
