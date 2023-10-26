import {html, TemplateResult, css} from 'lit';
import {customElement, query, property} from 'lit/decorators.js';
import {CommentPanelsStyles} from '../common-comments.styles';
import './messages-panel-header';
import './message-item';
import {translate} from 'lit-translate';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {EditComments} from '../../comments/edit-comments-base';
import {CommentRelatedItem} from '../../comments/comments-types';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import {buttonsStyles} from '@unicef-polymer/etools-unicef/src/styles/button-styles';

@customElement('messages-panel')
export class MessagesPanel extends EditComments {
  @query('#messages-container') container?: HTMLElement;
  @property() relatedToKey = '';
  @property() relatedItem: CommentRelatedItem | null = null;

  set collectionId(collectionId: string) {
    if (!collectionId) {
      return;
    }
    this.updateComplete.then(() => this.scrollDown());
  }
  protected render(): TemplateResult {
    return html`
      <style>
        etools-textarea::part(textarea) {
          max-height: 96px;
          overflow-y: auto;
        }
      </style>
      <messages-panel-header
        .relatedToKey="${this.relatedToKey}"
        .relatedItem="${this.relatedItem}"
      ></messages-panel-header>
      <div class="data-container layout-vertical">
        <div class="messages" id="messages-container">
          ${this.comments?.map(
            (comment, index) => html`<message-item
              ?my-comment="${comment.user.id === this.currentUser.id}"
              .resolving="${this.isResolving(comment.id)}"
              .deleting="${this.isDeleting(comment.id)}"
              @resolve="${() => this.resolveComment(comment.id, index)}"
              @delete="${() => this.deleteComment(comment.id, index)}"
              @retry="${() => this.retry(index)}"
              .comment="${comment}"
              my-comment
            ></message-item>`
          )}
        </div>

        <div class="message-input">
          <etools-textarea
            max-rows="3"
            no-label-float
            placeholder="${translate('GENERAL.ENTER_MESSAGE_HERE')}"
            .value="${this.newMessageText}"
            @value-changed="${({detail}: CustomEvent) => {
              this.newMessageText = detail.value;
              this.requestUpdate();
            }}"
            @keyup="${(event: KeyboardEvent) => this.onKeyup(event)}"
            @keydown="${(event: KeyboardEvent) => this.onKeydown(event)}"
          ></etools-textarea>
          <sl-button variant="primary" class="send-btn" @click="${() => this.addComment()}"
            >${translate('POST')}</sl-button
          >
        </div>
      </div>
    `;
  }

  scrollDown(): void {
    if (!this.container) {
      return;
    }
    this.container.scrollTop = this.container.scrollHeight;
  }

  static get styles() {
    // language=css
    return [
      gridLayoutStylesLit,
      CommentPanelsStyles,
      buttonsStyles,
      css`
        :host {
          transition: 0.5s;
          z-index: 10 !important;
          box-shadow: 0 4px 10px 3px rgba(0, 0, 0, 0) !important;
        }
        @media screen and (min-width: 890px) {
          :host(.opened) {
            box-shadow: 0 4px 10px 3px rgba(0, 0, 0, 0.17) !important;
            transform: translateX(calc(-100% + 28px));
            margin-right: 18px;
          }
          .data-container {
            padding-right: 10px;
          }
        }
        @media screen and (max-width: 889px) {
          :host(.opened) {
            z-index: 20 !important;
            right: 0 !important;
            left: none !important;
          }
        }
        .messages {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px 40px 16px 22px;
          background-color: #dff1ef;
        }
        .message-input {
          display: flex;
          align-items: flex-end;
          padding-top: 12px;
          padding-bottom: 11px;
          padding-inline-start: 25px;
          padding-inline-end: 20px;
          border-top: 1px solid var(--light-divider-color);
          background-color: var(--primary-background-color);
          margin-bottom: 0;
        }
        .send-btn {
          --sl-color-primary-600: #009688;
          margin: 0 4px 7px 8px !important;
        }
      `
    ];
  }
}
