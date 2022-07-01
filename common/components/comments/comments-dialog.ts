import {
  customElement,
  LitElement,
  html,
  TemplateResult,
  property,
  CSSResultArray,
  css,
  query,
  PropertyValues,
  queryAll
} from 'lit-element';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/paper-input/paper-textarea';
import './comment';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {addComment, updateComment} from './comments.actions';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import {RootState} from '../../types/store.types';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';
import {InterventionComment, GenericObject} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {setTextareasMaxHeight} from '@unicef-polymer/etools-modules-common/dist/utils/textarea-max-rows-helper';
import {CommentsEndpoints} from './comments-types';

@customElement('comments-dialog')
export class CommentsDialog extends connectStore(LitElement) {
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
  @property() commentsDialogTitle = '';
  @property() dialogOpened = true;
  @property() comments: (InterventionComment & {loadingError?: boolean})[] = [];
  @queryAll('paper-textarea') textareas!: PaperTextareaElement[];
  @property() endpoints!: CommentsEndpoints;

  set dialogData({interventionId, relatedTo, relatedToDescription, endpoints}: any) {
    this.interventionId = interventionId;
    this.relatedTo = relatedTo;
    this.endpoints = endpoints;
    this.commentsDialogTitle = `Comments on: ${relatedToDescription}`;
    const comments: GenericObject<InterventionComment[]> =
      getStore().getState().commentsData.collection[interventionId];
    const relatedToComments: InterventionComment[] = (comments && comments[relatedTo]) || [];
    this.comments = [...relatedToComments];
    this.requestUpdate().then(() => this.scrollDown());
  }
  private interventionId!: number;
  private relatedTo!: string;

  private resolvingCollection: Set<number> = new Set();
  private deletingCollection: Set<number> = new Set();
  private newMessageText = '';
  private currentUser: any;
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
        dialog-title="${this.commentsDialogTitle}"
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
          <div class="no-comments" ?hidden="${this.comments.length}">There are no comments yet</div>
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
          <paper-button class="send-btn" @click="${() => this.addComment()}">Post</paper-button>
          <paper-button class="cancel-btn" @click="${() => this.onClose()}">Close</paper-button>
        </div>
      </etools-dialog>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    setTimeout(() => setTextareasMaxHeight(this.textareas));
  }

  stateChanged(state: RootState): void {
    if (this.currentUser) {
      return;
    }
    const {user, first_name, last_name, middle_name, name} = state.user.data!;
    // take fields to correspond the shape of user object inside comment object
    this.currentUser = {
      id: user,
      first_name,
      last_name,
      middle_name,
      name
    };
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  isResolving(id: number): boolean {
    return this.resolvingCollection.has(id);
  }

  isDeleting(id: number): boolean {
    return this.deletingCollection.has(id);
  }

  resolveComment(id: number, index: number): void {
    this.requestUpdate();
    this.resolvingCollection.add(id);
    sendRequest({
      endpoint: getEndpoint(this.endpoints.resolveComment, {interventionId: this.interventionId, commentId: id}),
      method: 'POST'
    })
      .then((updatedComment: InterventionComment) => {
        this.resolvingCollection.delete(id);
        this.comments[index] = updatedComment;
        getStore().dispatch(updateComment(this.relatedTo, updatedComment, this.interventionId));
        this.requestUpdate();
      })
      .catch(() => {
        this.resolvingCollection.delete(id);
        fireEvent(this, 'toast', {text: 'Can not resolve comment. Try again'});
        this.requestUpdate();
      });
  }

  deleteComment(id: number, index: number): void {
    if (!id) {
      this.deleteNotUploaded(index);
      return;
    }
    this.requestUpdate();
    this.deletingCollection.add(id);
    sendRequest({
      endpoint: getEndpoint(this.endpoints.deleteComment, {interventionId: this.interventionId, commentId: id}),
      method: 'POST'
    })
      .then((updatedComment: InterventionComment) => {
        this.deletingCollection.delete(id);
        this.comments[index] = updatedComment;
        getStore().dispatch(updateComment(this.relatedTo, updatedComment, this.interventionId));
        this.requestUpdate();
      })
      .catch(() => {
        this.deletingCollection.delete(id);
        fireEvent(this, 'toast', {text: 'Can not delete comment. Try again'});
        this.requestUpdate();
      });
  }

  // comment argument will be provide for 'retry' functionality (after send error)
  addComment(comment?: any): void {
    if (!comment && !this.newMessageText) {
      return;
    }
    this.requestUpdate().then(() => {
      if (!comment) {
        // scroll down if comment is new
        this.scrollDown();
        this.dialogElement.notifyResize();
      }
    });
    // take existing comment
    const body = comment || {
      text: this.newMessageText,
      user: this.currentUser,
      related_to: this.relatedTo
    };
    this.comments.push(body);
    if (!comment) {
      this.newMessageText = '';
    }
    sendRequest({
      endpoint: getEndpoint(this.endpoints.saveComments, {interventionId: this.interventionId}),
      method: 'POST',
      body
    })
      .then((newComment: InterventionComment) => {
        // remove old comment
        const index: number = this.comments.indexOf(body);
        this.comments.splice(index, 1);
        // add newly created comment to the end of comments array
        this.comments.push(newComment);
        getStore().dispatch(addComment(this.relatedTo, newComment, this.interventionId));
        this.requestUpdate().then(() => {
          if (comment) {
            this.scrollDown();
          }
        });
      })
      .catch(() => {
        const index: number = this.comments.indexOf(body);
        this.comments.splice(index, 1, {
          ...body,
          loadingError: true
        });
        this.requestUpdate();
      });
  }

  deleteNotUploaded(index: number): void {
    this.comments.splice(index, 1);
    this.requestUpdate();
  }

  retry(index: number): void {
    const [commentForRetry] = this.comments.splice(index, 1);
    commentForRetry.loadingError = false;
    this.addComment({...commentForRetry});
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

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.ctrlKey) {
      event.preventDefault();
    }
  }

  private scrollDown(): void {
    if (this.dialogElement) {
      this.dialogElement.scrollDown();
    }
  }

  private updateHeight(): void {
    this.dialogElement.notifyResize();
  }
}
