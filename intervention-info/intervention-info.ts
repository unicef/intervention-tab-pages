import {customElement, html, LitElement, property} from 'lit-element';
import '../common/layout/etools-tabs.js';
import {elevationStyles} from '../common/styles/elevation-styles.js';
import {fireEvent} from '../utils/fire-custom-event.js';
import './intervention-summary.js';
import './intervention-implementation-status.js';
import './intervention-monitoring-activities.js';
import './intervention-progress.js';
import './intervention-reports.js';
import get from 'lodash-es/get';
import {pageIsNotCurrentlyActive} from '../utils/common-methods.js';
import {RootState} from '../common/types/store.types.js';
import { isUnicefUser } from '../common/selectors.js';
import { connectStore } from '../common/mixins/connect-store-mixin.js';

@customElement('intervention-info')
export class InterventionInfo extends connectStore(LitElement) {
  static get styles() {
    return [elevationStyles];
  }
  render() {
    return html`
      <style>
        div[elevation] {
          margin-bottom: 15px;
          background-color: var(--primary-background-color);
        }
        .border-b {
          border-bottom: 1px solid var(--dark-divider-color);
        }
        *[hidden] {
          display: none;
        }
      </style>
      <div class="elevation" elevation="1" id="container">
        <intervention-summary ?hidden="${this.activeSubTab !== 'summary'}"></intervention-summary>
        ${this.isUnicefUser
          ? html`
              <intervention-implementation-status
                ?hidden="${this.activeSubTab !== 'implementation-status'}"
              ></intervention-implementation-status>
              <intervention-monitoring-activities
                ?hidden="${this.activeSubTab !== 'monitoring-activities'}"
              ></intervention-monitoring-activities>
              <intervention-progress ?hidden="${this.activeSubTab !== 'progress'}"></intervention-progress>
              <intervention-reports ?hidden="${this.activeSubTab !== 'reports'}"></intervention-reports>
            `
          : ''}
      </div>
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
