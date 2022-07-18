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
      }
    ];

    @property({type: String})
    activeTab = 'details';

    connectedCallback() {
      super.connectedCallback();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
    }
  }
  return IndicatorDialogTabsClass;
}

export default IndicatorDialogTabsMixin;
