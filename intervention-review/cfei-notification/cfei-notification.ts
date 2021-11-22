import {customElement, LitElement, html, TemplateResult, property} from 'lit-element';

@customElement('cfei-notification')
export class CfeiNotification extends LitElement {
  @property() cfeiNumber = '';

  get linkUrl(): string {
    return `https://www.unpartnerportal.org/cfei/open?agency=1&displayID=${encodeURIComponent(
      this.cfeiNumber
    )}&page=1&page_size=10`;
  }

  protected render(): TemplateResult {
    return html` <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }

        etools-content-panel::part(ecp-header-title) {
          font-weight: 500;
          text-align: left;
          font-size: 18px;
          margin-left: 80px;
        }

        .text {
          font-size: 17px;
          color: var(--primary-text-color);
          padding: 20px 0 15px 80px;
        }

        div[slot='panel-btns'].bookmark {
          position: absolute;
          top: 4px;
          right: auto;
          left: 20px;
          color: grey;
          -webkit-transform: scale(0.9, 1.5);
          -moz-transform: scale(0.9, 1.5);
          -ms-transform: scale(0.9, 1.5);
          -o-transform: scale(0.9, 1.5);
          transform: scale(0.9, 1.5);
          opacity: 1;
        }

        div[slot='panel-btns'].bookmark iron-icon {
          width: 60px !important;
          height: 60px !important;
          color: var(--warning-color);
        }
      </style>
      <etools-content-panel class="cancellation-tab" panel-title="CFEI Notification">
        <div slot="panel-btns" class="bookmark">
          <iron-icon icon="bookmark"></iron-icon>
        </div>

        <div class="text">
          This PD was completed after a selection in UNPP where a committee has approved, please review the work done in
          UNPP by clicking this
          <a href="${this.linkUrl}" target="_blank">link</a>
        </div>
      </etools-content-panel>`;
  }
}
