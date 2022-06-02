import {LitElement, html, customElement, property} from 'lit-element';

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
          position: sticky;
          top: 0;
          z-index: 120;
          width: 100%;
          box-sizing: border-box;

          background-color: var(--primary-background-color);
          min-height: 65px;
          border-bottom: 1px solid var(--light-divider-color);

          --page-title: {
            margin: 0;
            font-weight: normal;
            text-transform: capitalize;
            font-size: 24px;
            line-height: 18px;
            min-height: 31px;
          }
        }

        :host([is-in-amendment]) {
          margin-top: -5px;
          border-top: 5px solid #ffd28b;
        }

        .content-header-row {
          display: flex;
          flex-direction: row;
          justify-content: center;
          flex-wrap: wrap;
          flex: 1;
          align-items: center;
          padding: 5px 12px 5px 24px;
        }

        .content-header-row h1 {
          @apply --page-title;
        }

        .modeContainer {
          padding-right: 20px;
        }

        .vb {
          border-left: 2px solid var(--light-hex-divider-color);
          padding-right: 20px;
          height: 30px;
        }

        .title {
          padding-right: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 400px;
        }

        .flex-block {
          max-width: 100%;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          flex: 1;
        }

        .statusContainer {
          padding-right: 20px;
        }

        .flex-block > * {
          margin: 7px 0 !important;
        }

        @media print {
          :host {
            padding: 0;
          }

          .content-header-row h1 {
            font-size: 18px;
          }
        }

        @media (max-width: 1300px) {
          .content-header-row {
            flex-direction: column;
          }
          .flex-block {
            place-content: center;
          }
        }

        @media (max-width: 770px) {
          .flex-block {
            flex-wrap: wrap;
            place-content: center;
          }
          .title {
            flex: 100%;
            max-width: 100%;
            text-align: center;
          }
          .vb {
            display: none;
          }
        }

        @media (max-width: 576px) {
          :host {
            padding: 0 5px;
          }
        }

        @media (max-width: 450px) {
          :host {
            position: relative;
          }
        }
      </style>

      <div class="content-header-row">
        <div class="flex-block">
          <h1 class="title">
            <slot name="page-title"></slot>
          </h1>
          <div class="vb"></div>
          <div class="modeContainer">
            <slot name="mode"></slot>
          </div>
          <div class="statusContainer">
            <slot name="statusFlag"></slot>
          </div>
        </div>
        <div class="row-actions">
          <slot name="title-row-actions"></slot>
        </div>
      </div>
    `;
  }

  @property()
  isInAmendment = false;
}
