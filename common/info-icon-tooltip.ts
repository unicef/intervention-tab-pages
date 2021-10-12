import {LitElement, html, property, customElement, css} from 'lit-element';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {PaperTooltipElement} from '@polymer/paper-tooltip';
import {callClickOnEnterPushListener} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';

@customElement('info-icon-tooltip')
export class InfoIconTooltip extends LitElement {
  static get styles() {
    return [
      elevationStyles,
      css`
        #info-icon {
          color: var(--primary-color);
        }

        .content {
          padding: 24px;
        }

        .tooltip-info {
          display: flex;
          flex-direction: column;
          padding: 6px;
          margin: 10px 0px;
          width: 100%;
          box-sizing: border-box;
        }

        .tooltip-info.gray-border {
          border: solid 1px var(--secondary-background-color);
        }

        .tooltip-info span {
          font-size: 14px;
        }

        .tooltip-info span.primary {
          font-weight: bold;
        }
      `
    ];
  }

  render() {
    // language=HTML
    return html`
      <style>
        :host {
          display: inline-block;
          cursor: pointer;
        }
        iron-icon {
          margin: var(--iit-margin, 0);
        }
        paper-tooltip {
          --paper-tooltip-background: #ffffff;
          --paper-tooltip: {
            padding: 0;
          }
          width: auto;
        }

        paper-tooltip span {
          font-size: 16px;
          color: var(--primary-text-color);
          line-height: 20px;
        }
      </style>

      <iron-icon tabindex="0" id="info-icon" icon="info-outline" @click="${this.showTooltip}"></iron-icon>
      <paper-tooltip
        for="info-icon"
        id="tooltip"
        manual-mode
        animation-entry="noanimation"
        .position="${this.position}"
      >
        ${this.getRatingInfoHtml()}
      </paper-tooltip>
    `;
  }

  @property({type: String})
  tooltipText = '';

  @property({type: String})
  position = 'right';

  private tooltipHandler: any;

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => callClickOnEnterPushListener(this.shadowRoot?.querySelector('#info-icon')), 200);
  }

  getRatingInfoHtml() {
    return html`
      <div class="content elevation" elevation="1">
        <div class="tooltip-info gray-border">
          <span class="primary">${this.tooltipText}</span>
        </div>
      </div>
    `;
  }

  showTooltip() {
    const tooltip = this.shadowRoot?.querySelector<PaperTooltipElement>('#tooltip')!;
    tooltip.show();

    this.tooltipHandler = this.hideTooltip.bind(this, tooltip);
    document.addEventListener('click', this.tooltipHandler, true);
  }

  hideTooltip(tooltip: PaperTooltipElement) {
    tooltip.hide();
    document.removeEventListener('click', this.tooltipHandler);
  }
}
