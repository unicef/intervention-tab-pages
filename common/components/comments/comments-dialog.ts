import {customElement, html, TemplateResult, property, CSSResultArray, css, query, queryAll} from 'lit-element';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/paper-input/paper-textarea';
import './comment';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import {InterventionComment, GenericObject} from '@unicef-polymer/etools-types';
import {get as getTranslation, translate} from 'lit-translate';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {CommentsItemsNameMap} from './comments-items-name-map';
import {EditComments} from './edit-comments-base';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';
import {removeTrailingIds} from './comments.helpers';

@customElement('comments-dialog')
export class CommentsDialog extends EditComments {
  @queryAll('paper-textarea') textareas!: PaperTextareaElement[];
  @property() dialogOpened = true;

  get dialogTitle(): string {
    if (!this.relatedTo) {
      return '';
    }
    const relatedToKey: string = removeTrailingIds(this.relatedTo);
    const itemType = CommentsItemsNameMap[relatedToKey];
    if (itemType) {
      const description = this.relatedToDescription ? ` - ${this.relatedToDescription}` : '';
      return `${getTranslation('COMMENTS_ON')} ${getTranslation(CommentsItemsNameMap[relatedToKey])}${description}`;
    } else if (this.relatedToDescription) {
      return `${getTranslation('COMMENTS_ON')} ${this.relatedToDescription}`;
    } else {
      return '';
    }
  }

  set dialogData({interventionId, relatedTo, relatedToDescription, endpoints}: any) {
    this.interventionId = interventionId;
    this.relatedTo = relatedTo;
    this.endpoints = endpoints;
    this.relatedToDescription = relatedToDescription;
    const comments: GenericObject<InterventionComment[]> =
      getStore().getState().commentsData.collection[interventionId];
    const relatedToComments: InterventionComment[] = (comments && comments[relatedTo]) || [];
    this.comments = [...relatedToComments];
    this.requestUpdate().then(() => this.scrollDown());
  }
  private dialogHeight?: number;
  @query('etools-dialog') private dialogElement!: EtoolsDialog;

  protected render(): TemplateResult {
    return html`
      ${sharedStyles}
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
      <etools-dialog
        size="md"
        keep-dialog-open
        ?opened="${this.dialogOpened}"
        dialog-title="${this.dialogTitle}"
        @close="${this.onClose}"
        no-padding
      >
        <div class="container">
          ${this.comments.map(
            (comment: any, index: number) =>
              html`<comment-element
                .comment="${comment}"
                ?my-comment="${comment.user.id === this.currentUser.id}"
                .resolving="${this.isResolving(comment.id)}"
                .deleting="${this.isDeleting(comment.id)}"
                @resolve="${() => this.resolveComment(comment.id, index)}"
                @delete="${() => this.deleteComment(comment.id, index)}"
                @retry="${() => this.retry(index)}"
              ></comment-element>`
          )}
          <div class="no-comments" ?hidden="${this.comments.length}">${translate('NO_COMMENTS')}</div>
        </div>
        <div class="message-input" slot="buttons">
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
          <paper-button class="send-btn" @click="${() => this.addComment()}">${translate('POST')}</paper-button>
          <paper-button class="cancel-btn" @click="${() => this.onClose()}">${translate('CLOSE')}</paper-button>
        </div>
      </etools-dialog>
    `;
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  onKeyup(event: KeyboardEvent): void {
    if (event.key !== 'Enter') {
      this.updateHeight();
      return;
    }
    if (event.ctrlKey) {
      this.newMessageText += '\n';
      this.requestUpdate();
      this.updateHeight();
    } else {
      this.addComment();
    }
  }

  scrollDown(): void {
    if (this.dialogElement) {
      this.dialogElement.scrollDown();
      this.dialogElement.notifyResize();
    }
  }

  private updateHeight(): void {
    this.dialogElement.notifyResize();
  }
  static get styles(): CSSResultArray {
    // language=css
    return [
      css`
        .message-input {
          display: flex;
          align-items: flex-end;
          padding: 16px 10px 8px 25px;
          border-top: 1px solid var(--light-divider-color);
          margin-bottom: 0;
        }
        .container {
          display: flex;
          flex-direction: column;
          padding: 24px;
        }
        comment-element[my-comment] {
          align-self: flex-end;
        }
        .cancel-btn {
          color: var(--primary-text-color, rgba(0, 0, 0, 0.87));
        }
        .send-btn {
          background: var(--primary-color);
          color: #ffffff;
        }
        .no-comments {
          font-size: 15px;
          font-style: italic;
          line-height: 16px;
          color: var(--secondary-text-color);
        }
      `
    ];
  }
}
