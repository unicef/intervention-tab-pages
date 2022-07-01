/* eslint-disable max-len */
import {customElement, LitElement, html, TemplateResult, property, CSSResultArray, css} from 'lit-element';
import {translate} from 'lit-translate';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {
  callClickOnEnterPushListener,
  callClickOnSpacePushListener
} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {PropertyValues} from 'lit-element/src/lib/updating-element';
import {TABS} from '../../common/constants';

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
      <paper-toggle-button id="showInactive" ?hidden="${!this.showInactiveToggle}" @iron-change=${this.inactiveChange}>
        ${translate('SHOW_INACTIVE')}
      </paper-toggle-button>

      <div class="layout-horizontal">
        <paper-menu-button id="view-menu-button" close-on-activate horizontal-align="right">
          <paper-button slot="dropdown-trigger" class="dropdown-trigger">
            ${this.selectedViewType}
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
        <a href="interventions/${this.interventionId}/${TABS.WorkplanEditor}">
          <div class="editor-link">
            Activities Editor
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
          justify-content: space-between;
        }
        :host(:not([show-inactive-toggle])) {
          justify-content: flex-end;
        }
        #showInactive {
          margin-right: 8px;
        }
        #view-menu-button {
          display: block;
          height: 32px;
          color: #5c5c5c;
          padding: 0;
          box-sizing: border-box;
        }
        paper-button {
          border: 1px solid #5c5c5c;
          border-radius: 8px;
        }
        a:focus,
        paper-button:focus {
          box-shadow: rgb(170 165 165 / 40%) 0 0 5px 4px;
        }
        #view-menu-button paper-button {
          height: 32px;
          padding-right: 0;
          font-size: 14px;
          text-transform: none;
          font-weight: 500;
        }
        #view-menu-button paper-button iron-icon {
          margin: 0 7px;
        }
        paper-item {
          white-space: nowrap;
        }
        a {
          text-decoration: none;
          margin-left: 16px;
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
          margin-left: 10px;
        }
      `
    ];
  }
}
