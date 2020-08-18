// import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';

import {EtoolsTab, Constructor} from '../../../../../common/models/globals.types';
import {property, LitElement} from 'lit-element';

/**
 * @polymer
 * @mixinFunction
 */
function IndicatorDialogTabsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class IndicatorDialogTabsClass extends baseClass {
    @property({type: Array})
    indicatorDataTabs: EtoolsTab[] = [
      {
        tab: 'details',
        tabLabel: 'Details'
      },
      {
        tab: 'disaggregations',
        tabLabel: 'Disaggregations',
        showTabCounter: true,
        counter: 0
      }
    ];

    @property({type: String})
    activeTab = 'details';

    static get observers() {// TODO
      return [
        '_setDisaggregationsCount1(disaggregations, prpDisaggregations, isCluster)',
        '_setDisaggregationsCount2(disaggregations.length, prpDisaggregations.length)'
      ];
    }

    /**
     * Update disaggegations tab counter
     */
    _updateDisaggregationsNrInTabLabel(disaggregationsCount: number) {
      this.indicatorDataTabs[1].counter = disaggregationsCount;
      this.requestUpdate();
    }

    _setDisaggregationsCount1(disaggregs: [], prpDisaggregs: []) {
      // @ts-ignore
      if (!this.indicator || !disaggregs || !prpDisaggregs) {
        this._updateDisaggregationsNrInTabLabel(0);
        return;
      }
      this._setDisaggregationsCount2(disaggregs.length, prpDisaggregs.length);
    }

    _setDisaggregationsCount2(disaggregsLength: number, prpDisaggregsLength: number) {
      if (typeof disaggregsLength === 'undefined' || typeof prpDisaggregsLength === 'undefined') {
        return;
      }
      // @ts-ignore
      const disaggregationsNr = this.isCluster ? prpDisaggregsLength : disaggregsLength;
      this._updateDisaggregationsNrInTabLabel(disaggregationsNr);
    }

    updateActiveTab(tab: string) {
      this.set('activeTab', tab);
    }
  }
  return IndicatorDialogTabsClass;
}

export default IndicatorDialogTabsMixin;
