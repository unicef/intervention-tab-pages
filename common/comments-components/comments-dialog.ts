import {customElement, LitElement, html, TemplateResult, property, CSSResultArray, css, query} from 'lit-element';
import {fireEvent} from '../../utils/fire-custom-event';
import '@unicef-polymer/etools-dialog';
import '@polymer/paper-input/paper-textarea';
import './comment';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {addComment, updateComment} from './comments.actions';
import {InterventionComment} from '../types/types';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {GenericObject} from '../models/globals.types';

@customElement('comments-dialog')
export class CommentsDialog extends connect(getStore())(LitElement) {
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
      `
    ];
  }
  @property() commentsDialogTitle = '';
  @property() dialogOpened = true;
  @property() comments: (InterventionComment & {loadingError?: boolean})[] = [];

  set dialogData({interventionId, relatedTo, relatedToDescription}: any) {
    this.interventionId = interventionId;
    this.relatedTo = relatedTo;
    this.commentsDialogTitle = `Comments on: ${relatedToDescription}`;
    const comments: GenericObject<InterventionComment[]> = getStore().getState().commentsData[interventionId];
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
      <style>
        etools-dialog {
          --etools-dialog-scrollable: {
            margin-top: 0 !important;
          }
        }
        paper-textarea {
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
        </div>
        <div class="message-input" slot="buttons">
          <paper-textarea
            max-rows="3"
            no-label-float
            placeholder="Enter Message Here"
            .value="${this.newMessageText}"
            @value-changed="${({detail}: CustomEvent) => {
              this.newMessageText = detail.value;
              this.requestUpdate();
            }}"
            @keydown="${(event: KeyboardEvent) => this.onKeydown(event)}"
          ></paper-textarea>
          <paper-button class="send-btn" @click="${() => this.addComment()}">Send</paper-button>
          <paper-button class="cancel-btn" @click="${() => this.onClose()}">Close</paper-button>
        </div>
      </etools-dialog>
    `;
  }

  stateChanged(state: any): void {
    if (this.currentUser) {
      return;
    }
    const {user, first_name, last_name, middle_name, name} = state.user.data;
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
      endpoint: getEndpoint(interventionEndpoints.resolveComment, {interventionId: this.interventionId, commentId: id}),
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
      endpoint: getEndpoint(interventionEndpoints.deleteComment, {interventionId: this.interventionId, commentId: id}),
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
      endpoint: getEndpoint(interventionEndpoints.comments, {interventionId: this.interventionId}),
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

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      this.dialogElement.notifyResize();
    }
    if (event.key !== 'Enter') {
      return;
    }
    if (event.ctrlKey) {
      this.newMessageText += '\n';
      this.performUpdate();
      this.dialogElement.notifyResize();
    } else {
      event.preventDefault();
      this.addComment();
    }
  }

  private scrollDown(): void {
    if (this.dialogElement) {
      this.dialogElement.scrollDown();
    }
  }
}
