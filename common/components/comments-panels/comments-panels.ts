import {customElement, LitElement, html, TemplateResult, CSSResultArray, css, property} from 'lit-element';
import './comments-list/comments-list';
import './messages-panel/messages-panel';
import {CommentPanelsStyles} from './common-comments.styles';
import {CommentsCollection} from '../comments/comments.reducer';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {RootState} from '../../types/store.types';
import {InterventionComment} from '@unicef-polymer/etools-types';
import {CommentsEndpoints} from '../comments/comments-types';
import {CommentItemData} from './comments-list/comments-list';

@customElement('comments-panels')
export class CommentsPanels extends connectStore(LitElement) {
  @property() messagesOpened = false;
  @property() commentsCollection?: CommentsCollection;
  @property() comments: InterventionComment[] = [];

  interventionId?: number;
  endpoints?: CommentsEndpoints;
  openedCollection: CommentItemData | null = null;

  protected render(): TemplateResult {
    return html`
      <comments-list
        @show-messages="${(event: CustomEvent) => this.openCollection(event.detail.commentsGroup)}"
        .commentsCollection="${this.commentsCollection}"
      ></comments-list>
      <messages-panel
        class="${this.openedCollection ? 'opened' : ''}"
        .relatedTo="${this.openedCollection?.relatedTo}"
        .collectionId="${this.openedCollection?.relatedTo}"
        .relatedToKey="${this.openedCollection?.relatedToTranslateKey}"
        .relatedToDescription="${this.openedCollection?.relatedToDescription}"
        .comments="${this.comments}"
        .interventionId="${this.interventionId}"
        .endpoints="${this.endpoints}"
        @hide-messages="${() => this.closeCollection()}"
      ></messages-panel>
    `;
  }

  stateChanged(state: RootState): void {
    console.log('testestsetsetset')
    const commentsState = state.commentsData;
    const currentInterventionId =
      Number(state.app.routeDetails?.params?.interventionId) || state.interventions?.current?.id || null;
    if (!commentsState || !currentInterventionId) {
      return;
    }

    this.interventionId = currentInterventionId;
    this.endpoints = state.commentsData.endpoints;
    const {collection} = commentsState;
    this.commentsCollection = {...(collection[currentInterventionId] || {})};
    if (this.openedCollection) {
      this.comments = [...this.commentsCollection![this.openedCollection.relatedTo]];
    }
  }

  openCollection(commentsGroup: CommentItemData) {
    this.openedCollection = commentsGroup;
    this.comments = [...this.commentsCollection![this.openedCollection.relatedTo]];
  }

  closeCollection(): void {
    this.openedCollection = null;
    this.comments = [];
  }

  static get styles(): CSSResultArray {
    // language=css
    return [
      CommentPanelsStyles,
      css`
        :host {
          display: block;
          position: fixed;
          top: 150px;
          right: 0;
          z-index: 99;
          margin: 0 18px;
          width: calc(100% - 36px);
          max-width: 450px;
        }
      `
    ];
  }
}
