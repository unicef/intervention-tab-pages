import {customElement, html, LitElement, property} from 'lit-element';
import '../common/layout/etools-tabs.js';
import {fireEvent} from '../utils/fire-custom-event.js';
import './intervention-summary.js';
import './intervention-implementation-status.js';
import './intervention-monitoring-activities.js';
import './intervention-progress.js';
import './intervention-reports.js';
import get from 'lodash-es/get';
import {pageIsNotCurrentlyActive} from '../utils/common-methods.js';
import {RootState} from '../common/types/store.types.js';
import {isUnicefUser} from '../common/selectors.js';
import {connectStore} from '../common/mixins/connect-store-mixin.js';
import {PAGES} from '../common/constants.js';

@customElement('intervention-info')
export class InterventionInfo extends connectStore(LitElement) {
  render() {
    return html`
      <style>
        *[hidden] {
          display: none;
        }
      </style>
      <intervention-summary ?hidden="${this.activeSubTab !== 'summary'}"></intervention-summary>
      ${this.isUnicefUser
        ? html`
            <intervention-implementation-status
              ?hidden="${this.activeSubTab !== PAGES.ImplementationStatus}"
            ></intervention-implementation-status>
            <intervention-monitoring-activities
              ?hidden="${this.activeSubTab !== PAGES.MonitoringActivities}"
            ></intervention-monitoring-activities>
            <intervention-progress ?hidden="${this.activeSubTab !== 'progress'}"></intervention-progress>
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
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'info')) {
      return;
    }

    this.isUnicefUser = isUnicefUser(state);
  }
}
