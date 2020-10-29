import {property, LitElement} from 'lit-element';
import {Constructor} from '@unicef-polymer/etools-types';

interface EtoolsTab {
  tab: string;
  tabLabel: string;
  hidden?: boolean;
  showTabCounter?: boolean;
  counter?: number;
}

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

    // static get observers() {
    //   // TODO
    //   return [
    //     '_setDisaggregationsCount1(disaggregations, prpDisaggregations, isCluster)',
    //     '_setDisaggregationsCount2(disaggregations.length, prpDisaggregations.length)'
    //   ];
    // }

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener('update-tab-counter', this.updateTabCount as any);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('update-tab-counter', this.updateTabCount as any);
    }

    updateTabCount(event: CustomEvent) {
      this.indicatorDataTabs[1].counter = event.detail.count;
      this.indicatorDataTabs = [...this.indicatorDataTabs];
    }

    // /**
    //  * Update disaggegations tab counter
    //  */
    // _updateDisaggregationsNrInTabLabel(disaggregationsCount: number) {
    //   this.indicatorDataTabs[1].counter = disaggregationsCount;
    //   this.requestUpdate();
    // }

    // _setDisaggregationsCount1(disaggregs: [], prpDisaggregs: []) {
    //   // @ts-ignore
    //   if (!this.indicator || !disaggregs || !prpDisaggregs) {
    //     this._updateDisaggregationsNrInTabLabel(0);
    //     return;
    //   }
    //   this._setDisaggregationsCount2(disaggregs.length, prpDisaggregs.length);
    // }

    // _setDisaggregationsCount2(disaggregsLength: number, prpDisaggregsLength: number) {
    //   if (typeof disaggregsLength === 'undefined' || typeof prpDisaggregsLength === 'undefined') {
    //     return;
    //   }
    //   // @ts-ignore
    //   const disaggregationsNr = this.isCluster ? prpDisaggregsLength : disaggregsLength;
    //   this._updateDisaggregationsNrInTabLabel(disaggregationsNr);
    // }

    // updateActiveTab(tab: string) {
    //   this.activeTab = tab;
    // }
  }
  return IndicatorDialogTabsClass;
}

export default IndicatorDialogTabsMixin;
