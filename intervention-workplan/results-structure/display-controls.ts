import {customElement, LitElement, html, TemplateResult, property, CSSResultArray, css} from 'lit-element';
import {translate} from 'lit-translate';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {
  callClickOnEnterPushListener,
  callClickOnSpacePushListener
} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {PropertyValues} from 'lit-element/src/lib/updating-element';

export const RESULT_VIEW = 'result_view';
export const BUDGET_VIEW = 'budget_view';
export const COMBINED_VIEW = 'combined_view';

@customElement('display-controls')
export class DisplayControls extends LitElement {
  @property({type: Boolean}) showIndicators = true;
  @property({type: Boolean}) showActivities = false;

  get viewType(): string {
    if (this.showActivities && this.showIndicators) {
      return COMBINED_VIEW;
    } else if (this.showActivities) {
      return BUDGET_VIEW;
    } else {
      return RESULT_VIEW;
    }
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
      <paper-toggle-button id="showInactive" @iron-change=${this.inactiveChange}>
        ${translate('SHOW_INACTIVE')}
      </paper-toggle-button>

      <paper-menu-button id="view-menu-button" close-on-activate horizontal-align="right">
        <paper-button slot="dropdown-trigger" class="dropdown-trigger">
          ${translate('VIEW')}
          <iron-icon icon="expand-more"></iron-icon>
        </paper-button>
        <paper-listbox slot="dropdown-content" attr-for-selected="name" .selected="${this.viewType}">
          ${this.viewTabs.map(
            (tab) =>
              html` <paper-item
                @click="${() => this.fireTabChange(tab.showIndicators, tab.showActivities)}"
                name="${tab.type}"
              >
                ${tab.name}
              </paper-item>`
          )}
        </paper-listbox>
      </paper-menu-button>
      ${this.viewTabs.map(
        (tab) => html`
          <div
            class="view-toggle-button layout-horizontal align-items-center"
            ?active="${tab.type === this.viewType}"
            tabindex="0"
            id="clickable"
            @click="${() => this.fireTabChange(tab.showIndicators, tab.showActivities)}"
          >
            ${tab.name}
          </div>
        `
      )}
    `;
  }

  firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);

    this.shadowRoot!.querySelectorAll('#view-toggle-button, .add-button paper-icon-button, iron-icon').forEach((el) =>
      callClickOnSpacePushListener(el)
    );
    this.shadowRoot!.querySelectorAll('#clickable').forEach((el) => callClickOnEnterPushListener(el));
  }

  inactiveChange(e: CustomEvent): void {
    if (!e.detail) {
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
          justify-content: flex-end;
          padding: 4px 0 24px;
        }
        #showInactive {
          margin-right: 8px;
        }
        #view-menu-button {
          display: none;
          height: 28px;
          color: #009688;
          border: 1px solid #009688;
          border-radius: 5px;
          padding: 1px;
        }
        #view-menu-button paper-button {
          height: 28px;
          background: var(--secondary-background-color);
          padding-right: 0;
        }
        #view-menu-button paper-button iron-icon {
          margin: 0 7px;
        }
        .view-toggle-button {
          display: flex;
          height: 32px;
          margin-left: 4px;
          padding: 0 19px;
          font-weight: 500;
          font-size: 14px;
          border-radius: 26px;
          background-color: #f8f8f8;
          color: #009688;
          cursor: pointer;
          box-shadow: 0 4px 4px rgba(0, 0, 0, 0.12);
          letter-spacing: 0.0357em;
        }
        .view-toggle-button[active] {
          background: #009688;
          box-shadow: 0 4px 4px rgba(0, 150, 136, 0.22);
          color: #fff;
        }
        .view-toggle-button:focus {
          outline: 0;
          box-shadow: 0 4px 4px rgba(0, 0, 0, 0.22);
        }
        @media (max-width: 1100px) {
          #view-menu-button {
            display: block;
          }
          .view-toggle-button {
            display: none;
          }
        }
      `
    ];
  }
}
