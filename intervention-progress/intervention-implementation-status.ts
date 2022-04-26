import {Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import {customElement, html, LitElement, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import {translate} from 'lit-translate';
import get from 'lodash-es/get';
import {RootState} from '../common/types/store.types';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import './fund-reservations-display.js';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {TABS} from '../common/constants';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {cloneDeep} from '@unicef-polymer/etools-modules-common/dist/utils/utils';

@customElement('intervention-implementation-status')
export class InterventionImplementationStatus extends connectStore(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      ${sharedStyles}
      <etools-content-panel
        id="fund-reservation-display"
        class="content-section"
        panel-title=${translate('IMPLEMENTATION_STATUS_SUBTAB')}
      >
        <fund-reservations-display
          .intervention="${this.intervention}"
          .frsDetails="${this.intervention?.frs_details}"
        ></fund-reservations-display>
      </etools-content-panel>
    `;
  }
  @property({type: Object})
  intervention!: Intervention;

  stateChanged(state: RootState) {
    if (
      pageIsNotCurrentlyActive(
        get(state, 'app.routeDetails'),
        'interventions',
        TABS.Progress,
        TABS.ImplementationStatus
      )
    ) {
      return;
    }

    if (get(state, 'interventions.current')) {
      this.intervention = cloneDeep(get(state, 'interventions.current'));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
  }
}
