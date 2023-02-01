import {customElement, html, TemplateResult, css, CSSResultArray, query, property} from 'lit-element';
import {CommentPanelsStyles} from '../common-comments.styles';
import './messages-panel-header';
import './message-item';
import {translate} from 'lit-translate';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {EditComments} from '../../comments/edit-comments-base';

@customElement('messages-panel')
export class MessagesPanel extends EditComments {
  @query('#messages-container') container?: HTMLElement;
  @property() relatedToKey = '';
  set collectionId(collectionId: string) {
    if (!collectionId) {
      return;
    }
    this.requestUpdate().then(() => this.scrollDown());
  }
  protected render(): TemplateResult {
    return html`
      <style>
        etools-dialog::part(ed-scrollable) {
          margin-top: 0 !important;
        }
        paper-textarea {
          outline: none;
          flex: auto;
          --paper-input-container-input: {
            display: block;
          }
        }
      </style>
      <messages-panel-header .relatedToKey="${this.relatedToKey}"></messages-panel-header>
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
          <paper-textarea
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
          ></paper-textarea>
          <paper-button class="send-btn" @click="${() => this.addComment()}">Post</paper-button>
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

  static get styles(): CSSResultArray {
    // language=css
    return [
      gridLayoutStylesLit,
      CommentPanelsStyles,
      css`
        :host {
          transition: 0.5s;
          z-index: 10 !important;
          box-shadow: 0 4px 10px 3px rgba(0, 0, 0, 0) !important;
        }
        :host(.opened) {
          box-shadow: 0 4px 10px 3px rgba(0, 0, 0, 0.17) !important;
          transform: translateX(calc(-100% + 28px));
          padding-right: 18px;
        }
        .data-container {
          padding-right: 10px;
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
          padding: 12px 20px 11px 25px;
          border-top: 1px solid var(--light-divider-color);
          background-color: var(--primary-background-color);
          margin-bottom: 0;
        }
        .send-btn {
          background: #009688;
          height: 36px;
          margin-bottom: 7px;
          color: #ffffff;
          margin-left: 8px;
        }
      `
    ];
  }
}