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
import {sharedStyles} from '../common/styles/shared-styles-lit';
import './monitoring-visits-list';

@customElement('intervention-monitoring-activities')
export class InterventionMonitoringActivities extends connectStore(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      <style>
        ${sharedStyles}
      </style>
      <etools-content-panel
        id="monitoring-visits-panel"
        class="content-section"
        panel-title=${translate('INTERVENTION_TABS.MONITORING_ACTIVITIES_SUBTAB')}
      >
        <monitoring-visits-list
          .interventionId="${this.intervention?.id}"
          .partnerId="${this.intervention?.partner_id}"
          showTpmVisits
        >
        </monitoring-visits-list>
      </etools-content-panel>
    `;
  }
  @property({type: Object})
  intervention!: Intervention;

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'info', 'monitoring-activities')) {
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
