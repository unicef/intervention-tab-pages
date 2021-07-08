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
            max-width: 100% !important;
            z-index: 99;
          }
        }

        paper-tab[is-subtabs-parent] {
          opacity: 1 !important;
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
        @media (max-width: 1024px) {
          paper-tabs {
            width: 100%;
          }
          paper-tab[link],
          paper-tab {
            padding: 0 !important;
          }
          paper-tab .tab-content {
            min-width: fit-content !important;
          }
          paper-tab[is-subtabs-parent] > paper-menu-button {
            padding: 0 !important;
            --paper-button_-_padding: 0.7em 0 !important;
            --paper-button_-_min-width: 0 !important;
          }
        }
      </style>

      <paper-tabs
        style="overflow: visible; max-width: 100%"
        id="tabs"
        selected="${this.activeTab}"
        attr-for-selected="name"
        noink
        @iron-activate="${this.cancelSelection}"
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
        @keyup=${this.callClickOnEnterSpaceDownKeys}
      >
        <paper-menu-button id="subtabmenu" horizontal-align="right" vertical-offset="45">
          <paper-button class="button" slot="dropdown-trigger">
            ${item.tabLabel}
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

  cancelSelection(e: CustomEvent) {
    if (e.detail.item.getAttribute('is-subtabs-parent')) {
      e.preventDefault();
    }
  }

  callClickOnEnterSpaceDownKeys(event: KeyboardEvent) {
    if (['Enter', ' ', 'ArrowDown'].includes(event.key) && !event.ctrlKey) {
      // Cancel the default action, if needed
      event.preventDefault();

      // @ts-ignore
      if (event.target!.localName !== 'paper-tab') {
        return;
      }
      ((event.target as any).querySelector('paper-button') as any).click();
    }
  }

  public notifyResize() {
    this.shadowRoot?.querySelector('paper-tabs')?.notifyResize();
  }
}
