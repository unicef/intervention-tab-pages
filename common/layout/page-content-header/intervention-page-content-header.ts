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
            line-height: 18px;
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
          z-index: 110;
        }
        .title-row {
          align-items: center;
          padding: 0 12px 0 24px;
          flex-wrap: wrap;
          justify-content: space-between;
        }
        .title-row h1 {
          @apply --page-title;
        }
        .tabs {
          margin-top: 5px;
        }

        @media (min-width: 450px) {
          .title-row.sticky {
            position: fixed;
            background: #fff;
            z-index: 120;
            padding-bottom: 9px;
            width: calc(100% - var(--app-drawer-width));
            border-bottom: 1px solid var(--light-divider-color);
            box-sizing: border-box;
          }

          .tabs.sticky {
            margin-top: 60px;
          }
        }

        @media (min-width: 771px) and (max-width: 1300px) {
          .tabs.sticky {
            margin-top: 114px;
          }
        }

        @media (min-width: 450px) and (max-width: 850px) {
          .title-row.sticky {
            width: 100%;
            left: 0;
          }
        }

        @media (min-width: 450px) and (max-width: 770px) {
          .tabs.sticky {
            margin-top: 153px;
          }
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

        @media (max-width: 1300px) {
          .content-header-row {
            display: flex;
            flex-direction: column;
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
            flex-wrap: wrap;
            place-content: center;
          }
          .title {
            flex: 100%;
            text-align: center;
          }
          .vb {
            display: none;
          }
        }
        .statusContainer {
          padding-left: 20px;
        }
        .vb {
          border-left: 2px solid var(--light-hex-divider-color);
          padding: 0 10px;
          height: 30px;
          margin-top: 15px;
        }
        .title {
          padding-right: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 300px;
        }
        .cont {
          display: flex;
          flex-direction: row
          justify-content: space-between;
          flex: 1;
          align-items: center;
        }
        .flex-block {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
        }
        .flex-block > :not(.vb) {
          margin-top: 15px !important;
        }
        .none-flex {
          flex: none;
        }
        .row-actions{
          margin-top: 15px;
        }
      </style>

      <div class="content-header-row title-row sticky">
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

      <div class="content-header-row tabs none-flex sticky" ?hidden="${this.withTabsVisible}">
        <slot name="tabs"></slot>
      </div>
    `;
  }

  @property({type: Boolean, reflect: true})
  withTabsVisible = false;
}
