import {Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import {customElement, html, LitElement, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import {translate} from 'lit-translate';
import get from 'lodash-es/get';
import {RootState} from '../common/types/store.types';
import {fireEvent} from '../../../etools-pages-common/utils/fire-custom-event';
import {sharedStyles} from '../../../etools-pages-common/styles/shared-styles-lit';
import './monitoring-visits-list';
import {TABS} from '../common/constants';
import {connectStore} from '../../../etools-pages-common/mixins/connect-store-mixin';
import {gridLayoutStylesLit} from '../../../etools-pages-common/styles/grid-layout-styles-lit';
import {pageIsNotCurrentlyActive} from '../../../etools-pages-common/utils/common-methods';
import {cloneDeep} from '../../../etools-pages-common/utils/utils';

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
        panel-title=${translate('MONITORING_ACTIVITIES_SUBTAB')}
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
    if (
      pageIsNotCurrentlyActive(
        get(state, 'app.routeDetails'),
        'interventions',
        TABS.Progress,
        TABS.MonitoringActivities
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
