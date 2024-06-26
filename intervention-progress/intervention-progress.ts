import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
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
    if (
      ![TABS.ImplementationStatus, TABS.MonitoringActivities, TABS.ResultsReported, TABS.Reports].includes(
        state.app?.routeDetails?.subRouteName!
      )
    ) {
      return;
    }

    this.isUnicefUser = isUnicefUser(state);
  }
}
