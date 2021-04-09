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
       <div class="border-b">
        <etools-tabs-lit
            .tabs="${this.tabs}"
            .activeTab="${this.activeTab}"
            @iron-select="${this._handleTabSelectAction}"
          ></etools-tabs-lit>
        </div>

        <intervention-summary ?hidden="${this.activeTab !== 'summary'}"></intervention-summary>
        <intervention-implementation-status ?hidden="${this.activeTab !== 'implementation-status'}"></intervention-implementation-status>
        <intervention-monitoring-activities ?hidden="${this.activeTab !== 'monitoring-activities'}"></intervention-monitoring-activities>
        <intervention-progress ?hidden="${this.activeTab !== 'progress'}"></intervention-progress>
        <intervention-reports ?hidden="${this.activeTab !== 'reports'}"></intervention-reports>

      </div>
    `;
  }

  @property({type: String})
  activeTab = 'summary';

  @property({type: Array})
  tabs = [
    {
      tab: 'summary',
      tabLabel: 'Summary',
      hidden: false
    },
    {
      tab: 'implementation-status',
      tabLabel: 'Implementation Status',
      hidden: false
    },
    {
      tab: 'monitoring-activities',
      tabLabel: 'Monitoring Activities',
      hidden: false
    },
    {
      tab: 'progress',
      tabLabel: 'Results Reported',
      hidden: false
    },
    {
      tab: 'reports',
      tabLabel: 'Reports',
      hidden: false
    }
  ]
  
  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
  }

  getTabHtml(item: any) {
    return html`
      <paper-tab name="${item.tab}" link ?hidden="${item.hidden}" ?disabled="${item.disabled}">
        <span class="tab-content"> ${item.tabLabel} ${item.showTabCounter ? html`(${item.counter})` : ''} </span>
      </paper-tab>
    `;
  }

  _handleTabSelectAction(e: CustomEvent) {
    this.activeTab = e.detail.item.getAttribute('name');
  }
}