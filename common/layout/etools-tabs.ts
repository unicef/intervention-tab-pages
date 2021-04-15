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
            max-width: 100% !important;
            z-index: 999;
          }
        }

        paper-listbox {
          z-index: 1000;
        }

        paper-tab[is-subtabs-parent][disabled] {
          cursor: pointer !important;
          --paper-tab-content-unselected: {
            opacity: 1;
          }
        }
        paper-tab[is-subtabs-parent] > paper-menu-button > paper-button {
          color: var(--secondary-text-color);
        }
        paper-tab.iron-selected[is-subtabs-parent] > paper-menu-button > paper-button {
          color: var(--primary-color) !important;
        }

        @media print {
          :host {
            display: none;
          }
        }
      </style>

      <paper-tabs
        style="overflow: visible; max-width: 100%"
        id="tabs"
        selected="${this.activeTab}"
        attr-for-selected="name"
        noink
      >
        ${this.tabs.map((item) => {
          if (item.subtabs) {
            return this.getSubtabs(item);
          } else {
            return this.getTabHtml(item);
          }
        })}
      </paper-tabs>
    `;
  }

  @property({type: String})
  activeTab = '';

  @property({type: String})
  activeSubTab = '';

  @property({type: Array})
  tabs!: AnyObject[];

  getTabHtml(item: any) {
    return html`
      <paper-tab name="${item.tab}" link ?hidden="${item.hidden}" ?disabled="${item.disabled}">
        <span class="tab-content"> ${item.tabLabel} ${item.showTabCounter ? html`(${item.counter})` : ''} </span>
      </paper-tab>
    `;
  }

  getSubtabs(item: any) {
    return html`
      <paper-tab
        style="overflow: visible !important;"
        name="${item.tab}"
        is-subtabs-parent="true"
        link
        ?hidden="${item.hidden}"
        ?disabled="${item.disabled}"
      >
        <paper-menu-button id="subtabmenu" horizontal-align="right" vertical-offset="45">
          <paper-button class="button" slot="dropdown-trigger">
            ${item.tab}
            <iron-icon icon="arrow-drop-down"></iron-icon>
          </paper-button>
          <paper-listbox slot="dropdown-content" attr-for-selected="subtab" selected="${this.activeSubTab}">
            ${item.subtabs.map(
              (subitem: any) => html`
                <paper-icon-item
                  name="${item.tab}"
                  subtab="${subitem.value}"
                  selected="${this.isSelectedSubtab(subitem.value)}"
                >
                  <iron-icon icon="check" slot="item-icon" ?hidden="${!this.isSelectedSubtab(subitem.value)}">
                  </iron-icon>
                  <paper-item-body>${subitem.label}</paper-item-body>
                </paper-icon-item>
              `
            )}
          </paper-listbox>
        </paper-menu-button>
      </paper-tab>
    `;
  }

  isSelectedSubtab(dropdownItemValue: string) {
    return dropdownItemValue == this.activeSubTab;
  }
}
