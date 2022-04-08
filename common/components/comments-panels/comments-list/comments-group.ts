import {css, CSSResultArray, customElement, LitElement, html, TemplateResult, property} from 'lit-element';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {translate} from 'lit-translate';

@customElement('comments-group')
export class CommentsGroup extends LitElement {
  @property({type: Number}) commentsCount = 0;
  @property({type: String}) relatedTo = '';
  @property({type: String}) relatedToDescription = '';
  @property({type: String}) fieldDescription = '';

  protected render(): TemplateResult {
    return html`
      <div class="counter">${this.commentsCount}</div>
      <div class="comment flex-auto">
        <div class="layout-horizontal space-between">
          <div class="title">
            Comments on
            <b>${this.relatedTo ? translate(this.relatedTo) : ''}</b>
          </div>
          <div class="date">17/02/2022</div>
        </div>
        <div class="description">
          ${this.relatedToDescription}${this.fieldDescription ? translate(this.fieldDescription) : ''}
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
