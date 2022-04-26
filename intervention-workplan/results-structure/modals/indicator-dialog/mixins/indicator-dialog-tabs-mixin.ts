import {property, LitElement} from 'lit-element';
import {Constructor} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

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
        tabLabel: translate('DETAILS_TAB') as unknown as string
      },
      {
        tab: 'disaggregations',
        tabLabel: translate('DISAGGREGATIONS_TAB') as unknown as string,
        showTabCounter: true,
        counter: 0
      }
    ];

    @property({type: String})
    activeTab = 'details';

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
  }
  return IndicatorDialogTabsClass;
}

export default IndicatorDialogTabsMixin;
