import {css, CSSResultArray, customElement, LitElement, html, TemplateResult} from 'lit-element';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';

@customElement('comments-group')
export class CommentsGroup extends LitElement {
  protected render(): TemplateResult {
    return html`
      <div class="counter">5</div>
      <div class="comment flex-auto">
        <div class="layout-horizontal space-between">
          <div class="title">Comments on <b>section 2.2</b></div>
          <div class="date">17/02/2022</div>
        </div>
        <div class="description">
          Capacity of national systems to scale upquality nutrition-sensitive interventions- 3750/A0/06/200/003]
        </div>
      </div>
    `;
  }

  static get styles(): CSSResultArray {
    // language=css
    return [
      gridLayoutStylesLit,
      css`
        :host {
          display: flex;
          padding: 21px 24px 24px 13px;
          cursor: pointer;
        }
        :host(:not(:last-child)) {
          border-bottom: 1px solid #c4c4c4;
        }
        :host(:hover) {
          background-color: #eeeeee;
        }
        .counter {
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #009688;
          margin-right: 12px;
          font-size: 18px;
          font-weight: 500;
          line-height: 21px;
          color: #ffffff;
        }
        .description,
        .title {
          font-size: 16px;
          line-height: 19px;
          color: #212121;
        }
        .date {
          font-size: 14px;
          line-height: 16px;
          color: #979797;
        }
        .description {
          margin-top: 8px;
        }
      `
    ];
  }
}
