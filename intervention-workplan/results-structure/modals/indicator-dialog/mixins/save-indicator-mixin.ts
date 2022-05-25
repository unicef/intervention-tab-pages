// import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';
import pick from 'lodash-es/pick';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {LitElement} from 'lit-element';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {interventionEndpoints} from '../../../../../utils/intervention-endpoints';
import {NonClusterIndicatorEl} from '../non-cluster-indicator';
import {ClusterIndicatorEl} from '../cluster-indicator';
import {IndicatorDisaggregations} from '../indicator-dissaggregations';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {updateCurrentIntervention} from '../../../../../common/actions/interventions';
import {Constructor} from '@unicef-polymer/etools-types';

/**
 * @mixinFunction
 */
function SaveIndicatorMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class SaveIndicatorClass extends baseClass {
    [x: string]: any;
    // @ts-ignore
    private nonClusterIndicatorCreateModel = {
      indicator: {
        title: null,
        unit: 'number',
        display_type: 'percentage'
      },
      section: null,
      baseline: {
        v: 0,
        d: 1
      },
      target: {
        v: 0,
        d: 1
      },
      means_of_verification: null,
      locations: [],
      disaggregation: [],
      is_high_frequency: false,
      numerator_label: null,
      denominator_label: null
    };
    // @ts-ignore
    private nonClusterIndicatorEditModel = {
      id: null,
      section: null,
      indicator: {
        title: null
      },
      baseline: {
        v: 0,
        d: 1
      },
      target: {
        v: 0,
        d: 1
      },
      means_of_verification: null,
      locations: [],
      disaggregation: [],
      is_high_frequency: false,
      numerator_label: null,
      denominator_label: null
    };
    // @ts-ignore
    private clusterIndicatorCreateModel = {
      section: null,
      baseline: {
        v: 0,
        d: 1
      },
      target: {
        v: 0,
        d: 1
      },
      locations: [],
      cluster_indicator_id: null,
      cluster_indicator_title: null,
      cluster_name: null,
      response_plan_name: null,
      numerator_label: null,
      denominator_label: null
    };
    // @ts-ignore
    private clusterIndicatorEditModel = {
      id: null,
      section: null,
      baseline: {
        v: 0,
        d: 1
      },
      target: {
        v: 0,
        d: 1
      },
      locations: [],
      numerator_label: null,
      denominator_label: null
    };

    _validateAndSaveIndicator() {
      if (!this.validate()) {
        // @ts-ignore *Defined in component
        this.activeTab = 'details';
        this._centerDialog();
        return;
      }

      this._startSpinner();
      // @ts-ignore *Defined in component
      this.disableConfirmBtn = true;

      const endpoint = getEndpoint(this._getEndpointName(), {
        id: this._getIdForEndpoint()
      });

      sendRequest({
        endpoint: endpoint,
        method: this.data!.id ? 'PATCH' : 'POST',
        body: this._getIndicatorBody()
      })
        .then((resp: any) => {
          this._handleSaveIndicatorResponse(resp);
        })
        .catch((error: any) => {
          this._handleSaveIndicatorError(error);
        });
    }

    validate() {
      let valid = true;
      const sectionSelected = this.shadowRoot!.querySelector<EtoolsDropdownEl>('#sectionDropdw')!.validate();
      valid = this.getIndicatorElement(this.isCluster)!.validate() && sectionSelected;
      return valid;
    }

    getElementId(isCluster: boolean) {
      return isCluster ? '#clusterIndicatorEl' : '#nonClusterIndicatorEl';
    }

    getIndicatorElement(isCluster: boolean): NonClusterIndicatorEl | ClusterIndicatorEl {
      return this.shadowRoot!.querySelector<any>(this.getElementId(isCluster));
    }

    _getIdForEndpoint() {
      return this.data.id ? this.data.id : this.llResultId;
    }

    _getEndpointName() {
      return this.data.id ? interventionEndpoints.getEditDeleteIndicator : interventionEndpoints.createIndicator;
    }

    _handleSaveIndicatorResponse(response: any) {
      this._stopSpinner();
      getStore().dispatch(updateCurrentIntervention(response.intervention));
      this.indicatorDialog.opened = false;
    }

    _handleSaveIndicatorError(error: any) {
      this._stopSpinner();
      // @ts-ignore *Defined in component
      this.disableConfirmBtn = false;

      parseRequestErrorsAndShowAsToastMsgs(error, this);
    }

    _getIndicatorBody() {
      const body = this._getIndicatorModelForSave();
      const indicatorData = this.collectIndicatorData();
      Object.assign(body, pick(indicatorData, Object.keys(body)));

      this._prepareBaselineAndTarget(body);

      if (Object.prototype.hasOwnProperty.call(body, 'disaggregation')) {
        body.disaggregation = this._prepareDisaggregationIds();
      }
      if (this.isCluster && !body.id) {
        body.indicator = null;
      }

      if (body.indicator && body.indicator.unit === 'number') {
        body.indicator.display_type = 'number';
      }
      return body;
    }

    collectIndicatorData() {
      return {...this.data, ...this.getIndicatorElement(this.isCluster).indicator};
    }

    _prepareBaselineAndTarget(indicator: any) {
      if (!indicator.target || indicator.target.v === undefined || indicator.target.v === '') {
        indicator.target = {v: 0, d: 1};
      }
      if (!indicator.baseline || indicator.baseline.v === '' || indicator.baseline.v === undefined) {
        indicator.baseline = {v: null, d: 1};
      }
      if (indicator.indicator) {
        // is new non-cluster indic
        if (indicator.indicator.unit === 'number') {
          this._updateBaselineTargetD(indicator, 1);
          this._resetRatioLabels(indicator);
        } else if (indicator.indicator.display_type === 'percentage') {
          this._updateBaselineTargetD(indicator, 100);
          this._resetLabel(indicator);
        }
      }
    }

    _updateBaselineTargetD(indicator: any, d: number) {
      indicator.baseline.d = d;
      indicator.target.d = d;
    }
    _resetRatioLabels(indicator: any) {
      indicator.numerator_label = '';
      indicator.denominator_label = '';
    }
    _resetLabel(indicator: any) {
      indicator.label = '';
    }

    _prepareDisaggregationIds(): number[] {
      let disaggregations = this.getDisaggregations();
      if (!disaggregations || !disaggregations.length) {
        return [];
      }
      // @ts-ignore *Defined in component
      disaggregations = disaggregations.filter(this._notEmptyDisaggregs);

      return disaggregations.map(function (item: {disaggregId: number}) {
        return item.disaggregId;
      });
    }

    _notEmptyDisaggregs(d: {disaggregId: number}): boolean {
      return !!d.disaggregId;
    }

    _getIndicatorModelForSave() {
      let modelName = this.isCluster ? 'clusterIndicator' : 'nonClusterIndicator';
      modelName += this.data.id ? 'EditModel' : 'CreateModel';
      return JSON.parse(JSON.stringify(this[modelName]));
    }

    getDisaggregations() {
      return this.shadowRoot?.querySelector<IndicatorDisaggregations>('#indicatorDisaggregations')?.data;
    }
  }
  return SaveIndicatorClass;
}

export default SaveIndicatorMixin;
