/* eslint-disable max-len */
import {LitElement, html, TemplateResult, CSSResultArray, css, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {translate} from 'lit-translate';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {
  callClickOnEnterPushListener,
  callClickOnSpacePushListener
} from '@unicef-polymer/etools-utils/dist/accessibility.util';
import {TABS} from '../../common/constants';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import {SlSelectEvent} from '@shoelace-style/shoelace';

export const RESULT_VIEW = 'result_view';
export const BUDGET_VIEW = 'budget_view';
export const COMBINED_VIEW = 'combined_view';

@customElement('display-controls')
export class DisplayControls extends LitElement {
  @property({type: Boolean, attribute: 'show-inactive-toggle'}) showInactiveToggle = false;
  @property({type: Boolean}) showIndicators = true;
  @property({type: Boolean}) showActivities = true;
  @property() interventionId!: number | null;

  get viewType(): string {
    if (this.showActivities && this.showIndicators) {
      return COMBINED_VIEW;
    } else if (this.showActivities) {
      return BUDGET_VIEW;
    } else {
      return RESULT_VIEW;
    }
  }
  get selectedViewType(): string {
    const selectedType = this.viewType;
    const tab: any = this.viewTabs.find(({type}) => type === selectedType);
    return tab?.name || '';
  }
  viewTabs = [
    {
      name: translate('RESULT_VIEW'),
      type: RESULT_VIEW,
      showIndicators: true,
      showActivities: false
    },
    {
      name: translate('COMBINED_VIEW'),
      type: COMBINED_VIEW,
      showIndicators: true,
      showActivities: true
    },
    {
      name: translate('BUDGET_VIEW'),
      type: BUDGET_VIEW,
      showIndicators: false,
      showActivities: true
    }
  ];

  protected render(): TemplateResult {
    return html`
      <sl-switch id="showInactive" ?hidden="${!this.showInactiveToggle}" @sl-change=${this.inactiveChange}>
        ${translate('SHOW_INACTIVE')}
      </sl-switch>

      <div class="layout-horizontal">
        <sl-dropdown
          id="view-menu-button"
          close-on-activate
          horizontal-align
          @sl-select=${(e: SlSelectEvent) => {
            const tab = this.viewTabs.find((x) => x.type === e.detail.item.value)!;
            this.fireTabChange(tab.showIndicators, tab.showActivities);
          }}
        >
          <sl-button variant="default" slot="trigger" caret>${this.selectedViewType} </sl-button>
          <sl-menu>
            ${this.viewTabs.map(
              (tab) =>
                html` <sl-menu-item
                  @click=${(e: Event) => {
                    // prevent selecting checked item
                    if ((e.target as any).checked) {
                      e.preventDefault();
                      e.stopImmediatePropagation();
                    }
                  }}
                  .checked="${this.viewType === tab.type}"
                  value="${tab.type}"
                  type="checkbox"
                >
                  ${tab.name}
                </sl-menu-item>`
            )}
          </sl-menu>
        </sl-dropdown>
        <a href="interventions/${this.interventionId}/${TABS.WorkplanEditor}">
          <div class="editor-link">
            ${translate('ACTIVITES_EDITOR')}
            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16.5334 0.5H0.672089C0.300894 0.5 0 0.779813 0 1.125V14.875C0 15.2202 0.300894 15.5 0.672089 15.5H16.5334C16.9046 15.5 17.2055 15.2202 17.2055 14.875V1.125C17.2055 0.779813 16.9046 0.5 16.5334 0.5ZM6.58647 10.5V8H10.619V10.5H6.58647ZM10.619 11.75V14.25H6.58647V11.75H10.619ZM10.619 4.25V6.75H6.58647V4.25H10.619ZM15.8613 4.25V6.75H11.9632V4.25H15.8613ZM5.24229 6.75H1.34418V4.25H5.24229V6.75ZM1.34418 8H5.24229V10.5H1.34418V8ZM11.9632 8H15.8613V10.5H11.9632V8ZM15.8613 1.75V3H1.34418V1.75H15.8613ZM1.34418 11.75H5.24229V14.25H1.34418V11.75ZM11.9632 14.25V11.75H15.8613V14.25H11.9632Z"
                fill="#009688"
              />
            </svg>
          </div>
        </a>
      </div>
    `;
  }

  firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);

    this.shadowRoot!.querySelectorAll('#view-toggle-button, .add-button paper-icon-button, sl-icon').forEach((el) =>
      callClickOnSpacePushListener(el)
    );
    this.shadowRoot!.querySelectorAll('#clickable').forEach((el) => callClickOnEnterPushListener(el));
  }

  inactiveChange(e: CustomEvent): void {
    if (!e.target) {
      return;
    }
    const element = e.currentTarget as HTMLInputElement;
    fireEvent(this, 'show-inactive-changed', {value: element.checked});
  }

  fireTabChange(showIndicators: boolean, showActivities: boolean): void {
    fireEvent(this, 'tab-view-changed', {showIndicators, showActivities});
  }
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      css`
        :host {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        :host(:not([show-inactive-toggle])) {
          justify-content: flex-end;
        }
        #showInactive {
          margin-inline-end: 8px;
        }
        #view-menu-button {
          display: block;
          height: 32px;
          color: #5c5c5c;
          padding: 0;
          box-sizing: border-box;
        }
        a:focus,
        sl-button:focus {
          box-shadow: rgb(170 165 165 / 40%) 0 0 5px 4px;
        }

        sl-button:focus-visible {
          outline: none !important;
        }

        paper-item {
          white-space: nowrap;
        }
        a {
          text-decoration: none;
          margin-inline-start: 16px;
          border-radius: 8px;
          outline: none;
        }
        .editor-link {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          padding: 0 10px;
          border: 1px solid #009688;
          border-radius: 8px;
          color: #009688;
          font-weight: 500;
          font-size: 14px;
          line-height: 16px;
          text-decoration: none;
          box-sizing: border-box;
        }
        svg {
          margin-inline-start: 10px;
        }
        sl-button {
          --sl-input-height-medium: 32px;
          --sl-color-neutral-700: rgb(92, 92, 92);
          --sl-color-neutral-300: rgb(92, 92, 92);
          --sl-input-border-radius-medium: 10px;
          border-radius: 10px;
          --sl-spacing-medium: 12px;
          --sl-color-primary-50: transparent;
          --sl-color-primary-300: rgb(92, 92, 92);
          --sl-color-primary-700: rgb(92, 92, 92);
        }
      `
    ];
  }
}
