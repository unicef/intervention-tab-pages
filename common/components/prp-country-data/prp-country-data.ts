import {LitElement, customElement} from 'lit-element';
// eslint-disable-next-line max-len
import EndpointsLitMixin from '../../../../../interventions/intervention-tab-pages/common/mixins/endpoints-mixin-lit';
import {connect} from 'pwa-helpers/connect-mixin';
import {store} from '../../../../../../../redux/store';
import {updatePrpCountries} from '../../../../../../../redux/actions/common-data';

@customElement('prp-country-data')
export class PrpCountryData extends connect(store)(EndpointsLitMixin(LitElement)) {
  getPRPCountries() {
    return this.fireRequest('getPRPCountries', {}).then((prpCountries: any[]) => {
      store.dispatch(updatePrpCountries(prpCountries));
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.getPRPCountries();
  }
}
