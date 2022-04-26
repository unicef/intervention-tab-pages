import {customElement, html, LitElement, property} from 'lit-element';
import get from 'lodash-es/get';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {TABS} from '../common/constants';
import {isUnicefUser} from '../common/selectors';
import {RootState} from '../common/types/store.types';
import './intervention-implementation-status.js';
import './intervention-monitoring-activities.js';
import './intervention-results-reported.js';
import './intervention-reports.js';

@customElement('intervention-progress')
export class InterventionProgress extends connectStore(LitElement) {
  render() {
    return html`
      <style>
        *[hidden] {
          display: none;
        }
      </style>
      ${this.isUnicefUser
        ? html`
            <intervention-implementation-status
              ?hidden="${this.activeSubTab !== TABS.ImplementationStatus}"
            ></intervention-implementation-status>
            <intervention-monitoring-activities
              ?hidden="${this.activeSubTab !== TABS.MonitoringActivities}"
            ></intervention-monitoring-activities>
            <intervention-results-reported
              ?hidden="${this.activeSubTab !== TABS.ResultsReported}"
            ></intervention-results-reported>
            <intervention-reports ?hidden="${this.activeSubTab !== 'reports'}"></intervention-reports>
          `
        : ''}
    `;
  }

  @property({type: String})
  activeSubTab = 'summary';

  @property({type: Boolean})
  isUnicefUser = false;

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Progress)) {
      return;
    }

    this.isUnicefUser = isUnicefUser(state);
  }
}
