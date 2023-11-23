import {css, LitElement, html, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {translate} from 'lit-translate';
import {CommentRelatedItem} from '../../comments/comments-types';

declare const dayjs: any;

@customElement('comments-group')
export class CommentsGroup extends LitElement {
  @property({type: Number}) commentsCount = 0;
  @property({type: String}) relatedItem: CommentRelatedItem | null = null;
  @property({type: String}) relatedTo = '';
  @property({type: String}) relatedToDescription = '';
  @property({type: String}) fieldDescription = '';
  @property({type: String}) lastCreatedMessageDate = '';

  protected render(): TemplateResult {
    return html`
      <div class="counter">${this.commentsCount}</div>
      <div class="comment flex-auto">
        <div class="layout-horizontal space-between">
          <div class="title">
            ${translate('COMMENTS_ON')}
            <b>${this.relatedTo ? translate(this.relatedTo) : ''} ${this.relatedItem?.code || ''}</b>
          </div>
          <div class="date">${this.date}</div>
        </div>
        <div class="description">${this.generatedDescription}</div>
      </div>
    `;
  }

  get date() {
    const date = dayjs(this.lastCreatedMessageDate);
    return `${date.format('DD/MM/YYYY')}`;
  }

  get generatedDescription() {
    if (this.relatedItem?.name) {
      return html`${this.relatedItem?.name}`;
    }

    return html`${this.relatedToDescription} ${this.fieldDescription ? translate(this.fieldDescription) : ''}`;
  }

  static get styles() {
    // language=css
    return [
      gridLayoutStylesLit,
      css`
        :host {
          display: flex;
          padding-top: 21px;
          padding-bottom: 24px;
          padding-inline: 13px 24px;
          cursor: pointer;
          border-bottom: 1px solid #c4c4c4;
        }
        :host(:not(:last-child)) {
          border-bottom: 1px solid #c4c4c4;
        }
        :host(:hover) {
          background-color: #eeeeee;
        }
        :host([opened]) {
          background-color: #dff1ef;
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
          margin-inline-end: 12px;
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
