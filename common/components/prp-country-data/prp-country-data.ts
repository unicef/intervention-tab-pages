import {LitElement, customElement} from 'lit-element';
// eslint-disable-next-line max-len
import EndpointsLitMixin from '../../../../intervention-tab-pages/common/mixins/endpoints-mixin-lit';
import {getStore} from '../../../utils/redux-store-access';
import {setPrpCountries} from '../../actions/interventions';
import get from 'lodash-es/get';

@customElement('prp-country-data')
export class PrpCountryData extends EndpointsLitMixin(LitElement) {
  getPRPCountries() {
    if (!(get(getStore().getState(), 'commonData.PRPCountryData') || []).length) {
      this.fireRequest('getPRPCountries', {}).then((prpCountries: any[]) => {
        getStore().dispatch(setPrpCountries(prpCountries));
      });
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.getPRPCountries();
  }
}
