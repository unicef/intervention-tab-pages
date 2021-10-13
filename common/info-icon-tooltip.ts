import {LitElement, html, property, customElement, css} from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
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
          padding: 20px;
          position: relative;
        }

        .tooltip-info {
          padding: 6px;
          margin: 10px 0px;
          box-sizing: border-box;
          font-size: var(--iit-font-size, 14px);
          color: var(--primary-text-color);
          line-height: 22px;
          font-weight: bold;
          user-select: text;
        }

        .tooltip-info.gray-border {
          border: solid 1px var(--secondary-background-color);
        }
        iron-icon {
          margin: var(--iit-margin, 0);
          width: var(--iit-icon-size, 24px);
          height: var(--iit-icon-size, 24px);
        }
        .close-link {
          font-weight: bold;
          top: 8px;
          right: 10px;
          font-size: 12px;
          position: absolute;
          color: var(--primary-color);
          text-decoration: none;
        }
      `
    ];
  }

  render() {
    // language=HTML
    return html`
      <style>
        paper-tooltip {
          --paper-tooltip-background: #ffffff;
          --paper-tooltip: {
            padding: 0;
          }
          width: auto;
        }
        :host {
          display: inline-block;
          cursor: pointer;
        }
      </style>

      <iron-icon tabindex="0" id="info-icon" icon="info-outline" @click="${this.showTooltip}"></iron-icon>
      <paper-tooltip
        for="info-icon"
        id="tooltip"
        fit-to-visible-bounds
        manual-mode
        animation-entry="noanimation"
        .position="${this.position}"
        .offset="${this.offset}"
      >
        <div class="content elevation" elevation="1">
          <a id="close" href="#" @click="${this.close}" class="close-link"> Close</a>
          <div class="tooltip-info gray-border">${unsafeHTML(this.tooltipText)}</div>
        </div>
      </paper-tooltip>
    `;
  }

  @property({type: String})
  tooltipText = '';

  @property({type: String})
  position = 'right';

  @property({type: String})
  offset = 14;

  private tooltipHandler: any;

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => callClickOnEnterPushListener(this.shadowRoot?.querySelector('#info-icon')), 200);
  }

  showTooltip() {
    const tooltip = this.shadowRoot?.querySelector<PaperTooltipElement>('#tooltip')!;
    tooltip.show();

    this.tooltipHandler = this.hideTooltip.bind(this);
    document.addEventListener('click', this.tooltipHandler, true);
  }

  hideTooltip(e: PointerEvent) {
    // @ts-ignore
    if (e.path[0].id !== 'close' && this._isInPath(e.path, 'localName', 'info-icon-tooltip')) {
      return;
    }

    this.shadowRoot?.querySelector<PaperTooltipElement>('#tooltip')?.hide();
    document.removeEventListener('click', this.tooltipHandler);
  }

  close(e: PointerEvent) {
    e.preventDefault();
    this.hideTooltip(e);
  }

  _isInPath(path: [], propertyName: string, elementName: string) {
    path = path || [];
    for (let i = 0; i < path.length; i++) {
      if (path[i][propertyName] === elementName) {
        return true;
      }
    }
    return false;
  }
}
