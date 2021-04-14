import { customElement, html, LitElement, property } from "lit-element";
import '../common/layout/etools-tabs.js';
import { elevationStyles } from "../common/styles/elevation-styles.js";
import { fireEvent } from "../utils/fire-custom-event.js";
import './intervention-summary.js';
import './intervention-implementation-status.js';
import './intervention-monitoring-activities.js';
import './intervention-progress.js';
import './intervention-reports.js';

@customElement('intervention-info')
export class InterventionInfo extends LitElement {
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
      <div class="elevation" elevation="1" id="container" style="position: static">
        <intervention-summary ?hidden="${this.activeSubTab !== 'summary'}"></intervention-summary>
        <intervention-implementation-status ?hidden="${this.activeSubTab !== 'implementation-status'}"></intervention-implementation-status>
        <intervention-monitoring-activities ?hidden="${this.activeSubTab !== 'monitoring-activities'}"></intervention-monitoring-activities>
        <intervention-progress ?hidden="${this.activeSubTab !== 'progress'}"></intervention-progress>
        <intervention-reports ?hidden="${this.activeSubTab !== 'reports'}"></intervention-reports>

      </div>
    `;
  }

  @property({type: String})
  activeSubTab = 'summary';
  
  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
  } 
}