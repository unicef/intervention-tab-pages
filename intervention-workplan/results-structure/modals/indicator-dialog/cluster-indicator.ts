import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import IndicatorsCommonMixin from './mixins/indicators-common-mixin';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import isEmpty from 'lodash-es/isEmpty';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {AnyObject} from '@unicef-polymer/etools-types';
import {Indicator} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {interventionEndpoints} from '../../../../utils/intervention-endpoints';
import {EtoolsInput} from '@unicef-polymer/etools-unicef/src/etools-input/etools-input';

/**
 * @customElement
 * @appliesMixin IndicatorsCommonMixin
 */
@customElement('cluster-indicator')
class ClusterIndicator extends connectStore(EndpointsLitMixin(IndicatorsCommonMixin(LitElement))) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
        }

        etools-input {
          width: 100%;
        }

        .dash-separator {
          padding: 0 8px 0 8px;
          margin-bottom: 10px;
        }

        .row-h {
          padding-top: 16px !important;
          padding-bottom: 0 !important;
        }

        .last-item {
          padding-bottom: 24px !important;
        }
      </style>
      ${!this.isNewIndicator
        ? html`
            <div class="row">
              <div class="col-6 col-sm-12">
                <div class="layout-vertical">
                  <label class="label">${translate('RESPONSE_PLAN')}</label>
                  <label class="input-label" ?empty="${!this.indicator?.response_plan_name}"
                    >${this.indicator?.response_plan_name}</label
                  >
                </div>
              </div>
              <div class="col-6 col-sm-12">
                <div class="layout-vertical">
                  <label class="label">${translate('CLUSTER')}</label>
                  <label class="input-label" ?empty="${!this.indicator?.cluster_name}"
                    >${this.indicator?.cluster_name}</label
                  >
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <div class="layout-vertical">
                  <label class="label">${translate('INDICATOR')}</label>
                  <label class="input-label" ?empty="${!this.indicator?.cluster_indicator_title}"
                    >${this.indicator?.cluster_indicator_title}</label
                  >
                </div>
              </div>
            </div>
          `
        : html``}
      ${this.isNewIndicator
        ? html`
            <div class="row">
              <div class="col-6 col-sm-12">
                <etools-dropdown
                  id="responsePlanDropdw"
                  label=${translate('RESPONSE_PLAN')}
                  placeholder="&#8212;"
                  .selected="${this.responsePlanId}"
                  .options="${this.responsePlans}"
                  option-label="title"
                  option-value="id"
                  error-message=${translate('RESPONSE_PLAN_ERR')}
                  fit-into="etools-dialog"
                  ?readonly="${this.readonly}"
                  trigger-value-change-event
                  @etools-selected-item-changed="${({detail}: CustomEvent) => {
                    this.responsePlanId = detail.selectedItem.id;
                    this.responsePlan = detail.selectedItem;
                  }}"
                >
                </etools-dropdown>
              </div>
              <div class="col-6 col-sm-12">
                <etools-dropdown
                  id="clusterDropdw"
                  label=${translate('CLUSTER')}
                  placeholder="&#8212;"
                  .selected="${this.clusterId}"
                  .options="${this.clusters}"
                  option-label="title"
                  option-value="id"
                  error-message=${translate('CLUSTER_ERR')}
                  fit-into="etools-dialog"
                  ?readonly="${this.readonly}"
                  trigger-value-change-event
                  @etools-selected-item-changed="${({detail}: CustomEvent) => {
                    this.clusterId = detail.selectedItem.id;
                    this.cluster = detail.selectedItem;
                  }}"
                >
                </etools-dropdown>
              </div>
            </div>
            <div class="row">
              <div class="col-4 col-sm-12">
                <etools-dropdown
                  id="clusterIndicatorDropdw"
                  label=${translate('INDICATOR')}
                  placeholder="&#8212;"
                  .selected="${this.indicator.cluster_indicator_id}"
                  .options="${this.prpClusterIndicators}"
                  option-label="title"
                  option-value="id"
                  required
                  auto-validate
                  error-message=${translate('INDICATOR_ERR')}
                  fit-into="etools-dialog"
                  ?readonly="${this.readonly}"
                  trigger-value-change-event
                  @etools-selected-item-changed="${({detail}: CustomEvent) => {
                    this.indicator.cluster_indicator_id = detail.selectedItem?.id;
                    this.prpClusterIndicator = !detail.selectedItem ? {} : detail.selectedItem;
                    this._selectedPrpClusterIndicatorChanged(this.prpClusterIndicator);
                  }}"
                >
                </etools-dropdown>
              </div>
            </div>
          `
        : html``}

      <div class="row" ?hidden="${this._typeMatches(this.prpClusterIndicator, 'number')}">
        <div class="col-4">
          <etools-input
            id="numeratorLbl"
            label=${translate('NUMERATOR_LABEL')}
            .value="${this.indicator.numerator_label}"
            placeholder="&#8212;"
            ?readonly="${this.readonly}"
            @value-changed="${({detail}: CustomEvent) => {
              this.indicator.numerator_label = detail.value;
            }}"
          >
          </etools-input>
        </div>
        <div class="col-4">
          <etools-input
            id="denomitorLbl"
            label=${translate('DENOMINATOR_LABEL')}
            .value="${this.indicator.denominator_label}"
            placeholder="&#8212;"
            ?readonly="${this.readonly}"
            @value-changed="${({detail}: CustomEvent) => {
              this.indicator.denominator_label = detail.value;
            }}"
          >
          </etools-input>
        </div>
      </div>

      ${this._typeMatches(this.prpClusterIndicator, 'ratio')
        ? html` <div class="row">
            <div class="col-4 layout-horizontal col-sm-12">
              <etools-input
                id="baselineNumerator"
                label=${translate('BASELINE')}
                .value="${this.indicator.baseline.v}"
                placeholder=${translate('NUMERATOR')}
                allowed-pattern="[0-9]"
                .pattern="${this.digitsNotStartingWith0Pattern}"
                auto-validate
                error-message=${translate('INVALID_ERR')}
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => {
                  this.indicator.baseline.v = detail.value;
                }}"
              >
              </etools-input>
              <div class="layout-horizontal bottom-aligned dash-separator">/</div>
              <etools-input
                id="baselineDenominator"
                .value="${this.indicator.baseline.d}"
                placeholder=${translate('DENOMINATOR')}
                allowed-pattern="[0-9]"
                .pattern="${this.digitsNotStartingWith0Pattern}"
                auto-validate
                error-message=${translate('INVALID_ERR')}
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => {
                  this.indicator.baseline.d = detail.value;
                }}"
              >
              </etools-input>
            </div>
            <div class="col-4 col-sm-12">
              <etools-input
                id="targetNumerator"
                label=${translate('TARGET')}
                .value="${this.indicator.target.v}"
                placeholder=${translate('NUMERATOR')}
                allowed-pattern="[0-9]"
                .pattern="${this.digitsNotStartingWith0Pattern}"
                auto-validate
                required
                error-message=${translate('INVALID_ERR')}
                ?readonly="${this.readonly}"
                @value-changed="${({detail}: CustomEvent) => {
                  this.indicator.target.v = detail.value;
                  this._targetChanged(this.indicator.target.v);
                }}"
              >
              </etools-input>
              <div class="layout-horizontal bottom-aligned dash-separator">/</div>
              <etools-input
                id="targetDenominator"
                placeholder=${translate('DENOMINATOR')}
                .value="${this.indicator.target.d}"
                readonly
                allowed-pattern="[0-9]"
                .pattern="${this.digitsNotStartingWith0Pattern}"
                required
                auto-validate
                error-message=${translate('INVALID_ERR')}
                @value-changed="${({detail}: CustomEvent) => {
                  this.indicator.target.d = detail.value;
                }}"
              >
              </etools-input>
            </div>
          </div>`
        : html``}
      ${!this._typeMatches(this.prpClusterIndicator, 'ratio')
        ? html`
            <div class="row">
              <div class="col-4 col-sm-12">
                <etools-currency
                  id="baselineEl"
                  label=${translate('BASELINE')}
                  .value="${this.indicator.baseline.v ?? ''}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.indicator.baseline.v = detail.value;
                    this._baselineChanged(this.indicator.baseline.v);
                  }}"
                  error-message=${translate('INVALID_NUMBER')}
                  ?readonly="${this.readonly}"
                ></etools-currency>
              </div>
              <div class="col-4 col-sm-12">
                <etools-currency
                  id="targetEl"
                  label=${translate('TARGET')}
                  required
                  .value="${this.indicator.target.v ?? ''}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.indicator.target.v = detail.value;
                    this._targetChanged(this.indicator.target.v);
                  }}"
                  error-message=${translate('VALID_TARGET_ERR')}
                  ?readonly="${this.readonly}"
                ></etools-currency>
              </div>
            </div>
          `
        : html``}
      <div class="row">
        <div class="layout-vertical">
          <label class="label">${translate('MEANS_OF_VERIFICATION')}</label>
          <label class="input-label" ?empty="${!this.prpClusterIndicator.means_of_verification}">
            ${this.prpClusterIndicator.means_of_verification}
          </label>
        </div>
      </div>
      <div class="last-item row">
        <etools-dropdown-multi
          id="locationsDropdw"
          label=${translate('LOCATIONS')}
          placeholder="&#8212;"
          .selectedValues="${this.indicator.locations}"
          .options="${this.locationOptions}"
          option-label="name"
          option-value="id"
          required
          auto-validate
          error-message=${translate('LOCATIONS_ERR')}
          fit-into="etools-dialog"
          ?readonly="${this.readonly}"
          trigger-value-change-event
          @etools-selected-items-changed="${({detail}: CustomEvent) => {
            const newIds = detail.selectedItems.map((i: any) => i.id);
            this.indicator.locations = newIds;
          }}"
        >
        </etools-dropdown-multi>
      </div>
    `;
  }

  private _indicator = {} as Indicator;
  @property({type: Object})
  get indicator() {
    return this._indicator;
  }

  set indicator(indic: Indicator) {
    this._indicator = indic;
    this.indicatorChanged(indic);
  }

  @property({type: Boolean})
  isNewIndicator!: boolean;

  @property({type: Array})
  clusters!: [];

  @property({type: String})
  clusterId!: string | undefined;

  @property({type: Array})
  locationOptions!: [];

  @property({type: String})
  responsePlanId!: string | undefined;

  @property({type: Boolean})
  readonly!: boolean | undefined;

  private _cluster!: AnyObject;
  @property({type: Object})
  get cluster() {
    return this._cluster;
  }

  set cluster(cluster: AnyObject) {
    this._cluster = cluster;
    this._clusterChanged(cluster);
  }

  @property({type: Array})
  prpClusterIndicators: [] = [];

  private _responsePlan!: AnyObject;
  @property({type: Object})
  get responsePlan() {
    return this._responsePlan;
  }

  set responsePlan(rp: AnyObject) {
    this._responsePlan = rp;
    this._responsePlanChanged(rp);
  }

  @property({type: Array})
  responsePlans!: AnyObject[];

  @property({type: Object})
  prpClusterIndicator: AnyObject = {};

  stateChanged(state: any) {
    this.endStateChanged(state);
  }

  connectedCallback() {
    super.connectedCallback();
    this.waitForReduxDataToLoad().then(() =>
      this.fireRequest(interventionEndpoints, 'getResponsePlans', {})
        .then((response: any) => {
          this.responsePlans = response;
        })
        .catch((error: any) => {
          fireEvent(this, 'show-toast', {
            error: {response: error.message || error.response}
          });
        })
    );

    this.resetValidations();
  }

  public waitForReduxDataToLoad() {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (this.currentUser && !isEmpty(this.prpCountries)) {
          clearInterval(check);
          resolve(true);
        }
      }, 50);
    });
  }

  indicatorChanged(indicator: any) {
    if (typeof indicator === 'undefined') {
      return;
    }
    if (!indicator || !indicator.id) {
      this.isNewIndicator = true;
      this.resetValidations();
    } else {
      this.isNewIndicator = false;
      if (indicator.cluster_indicator_id) {
        this._getPrpClusterIndicator(indicator.cluster_indicator_id);
      }
    }
  }

  _getPrpClusterIndicator(clusterIndicId: string) {
    fireEvent(this, 'start-spinner', {spinnerText: getTranslation('GENERAL.LOADING')});

    this.fireRequest(interventionEndpoints, 'getPrpClusterIndicator', {id: clusterIndicId})
      .then((response: any) => {
        this.prpClusterIndicator = response;
        fireEvent(this, 'stop-spinner');
      })
      .catch((error: any) => {
        fireEvent(this, 'stop-spinner');
        fireEvent(this, 'show-toast', {
          error: {response: error.message || error.response}
        });
      });
  }

  _responsePlanChanged(responsePlan: any) {
    this.clusterId = undefined;

    if (!responsePlan) {
      return;
    }
    this.indicator.response_plan_name = responsePlan.title;
    this._populateClusters(responsePlan.id);
  }

  _populateClusters(selectedRespPlanId: string) {
    if (!selectedRespPlanId) {
      this.clusters = [];
      return;
    }
    this.clusters = this.responsePlans.filter(function (r: any) {
      return parseInt(r.id) === parseInt(selectedRespPlanId);
    })[0].clusters;
  }

  _clusterChanged(cluster: any) {
    this.prpClusterIndicators = [];
    this.indicator.cluster_indicator_id = null;

    if (!cluster) {
      return;
    }
    this._populatePrpClusterIndicators(cluster.id);
    this.indicator.cluster_name = cluster.title;
  }

  _populatePrpClusterIndicators(clusterId: string) {
    if (!clusterId) {
      return;
    }
    fireEvent(this, 'start-spinner', {spinnerText: getTranslation('GENERAL.LOADING')});

    this.fireRequest(interventionEndpoints, 'getPrpClusterIndicators', {id: clusterId})
      .then((response: any) => {
        this.prpClusterIndicators = this._unnestIndicatorTitle(response.results);
        fireEvent(this, 'stop-spinner');
      })
      .catch((error: any) => {
        fireEvent(this, 'stop-spinner');
        fireEvent(this, 'show-toast', {
          error: {response: error.message || error.response}
        });
      });
  }

  /* ESM dropdown can't process a nested property as option-label
    and it was decided to not add that functionality to the dopdown yet */
  _unnestIndicatorTitle(indicators: []) {
    indicators.forEach(function (indic: any) {
      indic.title = indic.blueprint.title;
    });
    return indicators;
  }

  _selectedPrpClusterIndicatorChanged(prpClusterIndic: any) {
    if (!prpClusterIndic || isEmpty(prpClusterIndic)) {
      fireEvent(this, 'prp-disaggregations-changed', {prpDisaggregations: []});
      if (this.indicator) {
        this.indicator.baseline = {};
        this.indicator.target = {d: '1'};
      }
      return;
    }

    this.indicator.cluster_indicator_title = prpClusterIndic.title;
    fireEvent(this, 'prp-disaggregations-changed', {prpDisaggregations: prpClusterIndic.disaggregations});
    fireEvent(this, 'update-tab-counter', {count: this.prpClusterIndicators.length});

    if (prpClusterIndic.blueprint.display_type === 'number') {
      this._resetDenominator(1);
      this._resetRatioLabels();
    } else if (prpClusterIndic.blueprint.display_type === 'percentage') {
      this._resetDenominator(100);
    } else if (prpClusterIndic.blueprint.display_type === 'ratio') {
      this.indicator.target.d = prpClusterIndic.target.d;
    }
  }

  _resetDenominator(newD: number) {
    this.indicator.baseline.d = newD;
    this.indicator.target.d = newD;
  }

  _resetRatioLabels() {
    this.indicator.numerator_label = '';
    this.indicator.denominator_label = '';
  }

  validate() {
    const elemIds = ['clusterIndicatorDropdw', 'locationsDropdw'];
    ([] as string[]).push.apply(elemIds, this._getIndicatorTargetElId());
    return this.validateComponents(elemIds);
  }

  _getIndicatorTargetElId(): string[] {
    if (!this.prpClusterIndicator || !this.prpClusterIndicator.blueprint) {
      return ['targetEl', 'baselineEl'];
    }
    if (this.prpClusterIndicator.blueprint.display_type === 'ratio') {
      return ['baselineNumerator', 'baselineDenominator', 'targetNumerator', 'targetDenominator'];
    }

    return ['targetEl', 'baselineEl'];
  }

  resetValidations() {
    setTimeout(() => {
      this._resetInvalid('#clusterIndicatorDropdw');

      this._resetInvalid('#locationsDropdw');

      this._resetInvalid('#targetEl');

      const targetNumerator = this.shadowRoot!.querySelector('#targetNumerator') as EtoolsInput;
      if (targetNumerator) {
        targetNumerator.invalid = false;

        this._resetInvalid('#targetDenominator');
        this._resetInvalid('#baselineNumerator');
        this._resetInvalid('#baselineDenominator');
      }
    }, 10);
  }

  _resetInvalid(elSelector: string) {
    const elem = this.shadowRoot!.querySelector(elSelector) as LitElement & {invalid: boolean};
    if (elem) {
      elem.invalid = false;
    }
  }

  resetFieldValues() {
    this.responsePlanId = undefined;
    this.clusterId = undefined;
    this.indicator.indicator = null;
  }

  _typeMatches(prpIndic: any, type: string) {
    if (!prpIndic || !prpIndic.blueprint) {
      return false;
    }
    return prpIndic.blueprint.display_type === type;
  }
}
export {ClusterIndicator as ClusterIndicatorEl};
