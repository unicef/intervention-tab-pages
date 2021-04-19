import {Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import {customElement, html, LitElement, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import {translate} from 'lit-translate';
import get from 'lodash-es/get';
import {connectStore} from '../common/mixins/connect-store-mixin';
import {gridLayoutStylesLit} from '../common/styles/grid-layout-styles-lit';
import {RootState} from '../common/types/store.types';
import {pageIsNotCurrentlyActive} from '../utils/common-methods';
import {fireEvent} from '../utils/fire-custom-event';
import {cloneDeep} from '../utils/utils';
import './fund-reservations-display.js';
import {sharedStyles} from '../common/styles/shared-styles-lit';

@customElement('intervention-implementation-status')
export class InterventionImplementationStatus extends connectStore(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      <style>
        ${sharedStyles}
      </style>
      <etools-content-panel
        id="fund-reservation-display"
        class="content-section"
        panel-title=${translate('INTERVENTION_TABS.IMPLEMENTATION_STATUS_SUBTAB')}
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
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'info', 'implementation-status')) {
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
