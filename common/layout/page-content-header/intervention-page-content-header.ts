import {LitElement, html, property, customElement} from 'lit-element';

/**
 * @LitElement
 * @customElement
 */
@customElement('intervention-page-content-header')
export class InterventionPageContentHeader extends LitElement {
  render() {
    // language=HTML
    return html`
      <style>
        *[hidden] {
          display: none !important;
        }

        :host {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          flex: none;

          background-color: var(--primary-background-color);
          padding: 0;
          min-height: 85px;
          border-bottom: 1px solid var(--dark-divider-color);

          --page-title: {
            margin: 0;
            font-weight: normal;
            text-transform: capitalize;
            font-size: 24px;
            line-height: 1.3;
            min-height: 31px;
          }
        }
        :host([with-tabs-visible]) {
          min-height: 114px;
        }
        .content-header-row {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
        }
        .title-row {
          align-items: center;
          margin: 15px 0 0;
          padding: 0 24px;
        }
        .title-row h1 {
          @apply --page-title;
        }
        .tabs {
          margin-top: 5px;
        }

        @media print {
          :host {
            padding: 0;
            border-bottom: none;
            min-height: 0 !important;
            margin-bottom: 16px;
          }

          .title-row h1 {
            font-size: 18px;
          }
        }

        @media (max-width: 1100px) {
          .content-header-row {
            display: flex;
            flex-direction: column;
          }
          .row-actions {
            margin-top: 20px;
          }
        }

        @media (max-width: 576px) {
          :host {
            padding: 0 5px;
          }
          .title-row {
            padding: 0 5px 5px 5px;
          }
        }
        @media (max-width: 770px) {
          .flex-block {
            flex-direction: column !important;
            align-items: center;
          }
          .modeContainer {
            margin-bottom: 8px;
          }
        }
        .statusContainer {
          padding-left: 20px;
        }
        .vb {
          border-left: 2px solid var(--light-hex-divider-color);
          padding: 0 20px;
        }
        .title {
          padding-right: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cont {
          display: flex;
          flex-direction: row
          justify-content: space-between;
          flex: 1;
          align-items: center;
        }
        .flex-block {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: row;
        }
        .none-flex {
          flex: none;
        }
      </style>

      <div class="content-header-row title-row">
        <div class="flex-block">
          <h1 class="title">
            <slot name="page-title"></slot>
          </h1>
          <div class="vb none-flex"></div>
          <div class="modeContainer none-flex">
            <slot name="mode"></slot>
          </div>
          <div class="statusContainer none-flex">
            <slot name="statusFlag"></slot>
          </div>
        </div>
        <div class="row-actions">
          <slot name="title-row-actions"></slot>
        </div>
      </div>

      <div class="content-header-row tabs none-flex" ?hidden="${this.withTabsVisible}">
        <slot name="tabs"></slot>
      </div>
    `;
  }

  @property({type: Boolean, reflect: true})
  withTabsVisible = false;
}
