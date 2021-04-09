import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/paper-tabs/paper-tab';
import {AnyObject} from '@unicef-polymer/etools-types';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';

/**
 * @LitElement
 * @customElement
 */

@customElement('etools-tabs-lit')
export class EtoolsTabs extends LitElement {
  public render() {
    // main template
    // language=HTML
    return html`
      <style>
        *[hidden] {
          display: none !important;
        }

        paper-tab[disabled] {
          opacity: 0.3;
        }

        *[disabled] {
          cursor: not-allowed !important;
          pointer-events: auto !important;
        }

        :host {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
        }

        :host([border-bottom]) {
          border-bottom: 1px solid var(--dark-divider-color);
        }

        paper-tabs {
          --paper-tabs-selection-bar-color: var(--primary-color);
        }

        paper-tab[link],
        paper-tab {
          --paper-tab-ink: var(--primary-color);
          padding: 0 24px;
        }

        paper-tab .tab-content {
          color: var(--secondary-text-color);
          text-transform: uppercase;
          min-width: 120px;
          text-align: center;
        }

        paper-tab.iron-selected .tab-content {
          color: var(--primary-color);
        }

        paper-tabs {
          --paper-tabs-container: {
            overflow: visible;
          }
        }

        @media print {
          :host {
            display: none;
          }
        }
      </style>

      <paper-tabs style="overflow: visible" id="tabs" selected="${this.activeTab}" attr-for-selected="name" noink>
        ${this.tabs.map((item) =>{ if (item.tab== 'info') {
          return this.getInfoTab(item);
        } else { return this.getTabHtml(item)} }
        )}
      </paper-tabs>
    `;
  }

  @property({type: String})
  activeTab = '';

  @property({type: Array})
  tabs!: AnyObject[];

  getTabHtml(item: any) {
    return html`
      <paper-tab name="${item.tab}" link ?hidden="${item.hidden}" ?disabled="${item.disabled}">
        <span class="tab-content"> ${item.tabLabel} ${item.showTabCounter ? html`(${item.counter})` : ''} </span>
      </paper-tab>
    `;
  }

  getInfoTab(item: any) {
    return html`
      <paper-tab style="overflow: visible !important;" name="${item.tab}" link ?hidden="${item.hidden}" ?disabled="${item.disabled}">
          
        <paper-menu-button id="tabmenu" ignore-select horizontal-align="right" vertical-offset="45">
            <paper-button class="button" slot="dropdown-trigger">              
              Info
              <iron-icon icon="arrow-drop-down"></iron-icon>
            </paper-button>
            <paper-listbox slot="dropdown-content" style="position:relative; z-index: 2000">
              
                <paper-icon-item @tap="selectInfoPage" selected="${item.selected}">
                  <iron-icon icon="check" slot="item-icon" ?hidden="${!item.selected}">
                  </iron-icon>
                  <paper-item-body>Summary</paper-item-body>
                </paper-icon-item>
                <paper-icon-item @tap="selectInfoPage" selected="${item.selected}">
                  <iron-icon icon="check" slot="item-icon" ?hidden="${!item.selected}">
                  </iron-icon>
                  <paper-item-body>Implementation Status</paper-item-body>
                </paper-icon-item>
                <paper-icon-item @tap="selectInfoPage" selected="${item.selected}">
                  <iron-icon icon="check" slot="item-icon" ?hidden="${!item.selected}">
                  </iron-icon>
                  <paper-item-body>Monitoring Activities</paper-item-body>
                </paper-icon-item>
                <paper-icon-item @tap="selectInfoPage" selected="${item.selected}">
                  <iron-icon icon="check" slot="item-icon" ?hidden="${!item.selected}">
                  </iron-icon>
                  <paper-item-body>Results Reported</paper-item-body>
                </paper-icon-item>
                <paper-icon-item @tap="selectInfoPage" selected="${item.selected}">
                  <iron-icon icon="check" slot="item-icon" ?hidden="${!item.selected}">
                  </iron-icon>
                  <paper-item-body>Reports</paper-item-body>
                </paper-icon-item>

            </paper-listbox>
          </paper-menu-button>
      </paper-tab>
    `;
   
  }
}
