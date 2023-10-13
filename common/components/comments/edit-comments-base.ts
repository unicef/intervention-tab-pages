import {InterventionComment} from '@unicef-polymer/etools-types';
import {LitElement, PropertyValues} from 'lit';
import {property} from 'lit/decorators.js';
import {CommentsEndpoints} from './comments-types';
import {RootState} from '../../types/store.types';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {addComment, updateComment} from './comments.actions';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {get as getTranslation} from 'lit-translate';

export abstract class EditComments extends connectStore(LitElement) {
  @property() comments: (InterventionComment & {loadingError?: boolean})[] = [];
  @property() endpoints!: CommentsEndpoints;
  newMessageText = '';
  currentUser: any;

  protected relatedToDescription = '';
  protected interventionId!: number;
  protected relatedTo!: string;

  private resolvingCollection: Set<number> = new Set();
  private deletingCollection: Set<number> = new Set();

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
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
        fireEvent(this, 'toast', {text: getTranslation('CAN_NOT_RESOLVE_COMMENT')});
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
        fireEvent(this, 'toast', {text: getTranslation('CAN_NOT_DELETE_COMMENT')});
        this.requestUpdate();
      });
  }

  // comment argument will be provide for 'retry' functionality (after send error)
  addComment(comment?: any): void {
    if (!comment && !this.newMessageText) {
      return;
    }
    this.updateComplete.then(() => {
      if (!comment) {
        // scroll down if comment is new
        this.scrollDown();
      }
    });
    // take existing comment
    const body = comment || {
      text: this.newMessageText,
      user: this.currentUser,
      related_to: this.relatedTo,
      related_to_description: this.relatedToDescription
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
        this.comments = [...this.comments];
        getStore().dispatch(addComment(this.relatedTo, newComment, this.interventionId));
        this.updateComplete.then(() => {
          this.scrollDown();
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

  // need to be implemented in base classes
  abstract scrollDown(): void;

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
      // this.updateHeight();
      return;
    }
    if (event.ctrlKey) {
      this.newMessageText += '\n';
      this.requestUpdate();
      // this.updateHeight();
    } else {
      this.addComment();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.ctrlKey) {
      event.preventDefault();
    }
  }
}
