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
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {buildUrlQueryString} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {ComponentsPosition} from '../comments/comments-items-name-map';

@customElement('comments-panels')
export class CommentsPanels extends connectStore(LitElement) {
  @property() messagesOpened = false;
  @property() commentsCollection?: CommentsCollection;
  @property() comments: InterventionComment[] = [];
  @property() minimized = false;

  interventionId?: number;
  endpoints?: CommentsEndpoints;
  openedCollection: CommentItemData | null = null;

  protected render(): TemplateResult {
    return html`
      <comments-list
        @show-messages="${(event: CustomEvent) => this.openCollection(event.detail.commentsGroup)}"
        @close-comments-panels="${this.closePanels}"
        @toggle-minimize="${this.toggleMinimize}"
        .selectedGroup="${this.openedCollection?.relatedTo}"
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

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.closeCollection();
  }

  stateChanged(state: RootState): void {
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
    const relatedToKey: string = this.openedCollection.relatedTo.replace(/(.+?)-\d+/, '$1');
    const expectedTab: string = ComponentsPosition[relatedToKey];
    const path = `interventions/${this.interventionId}/${expectedTab}${location.search}`;
    history.pushState(window.history.state, '', path);
    window.dispatchEvent(new CustomEvent('popstate'));
  }

  closeCollection(): void {
    this.openedCollection = null;
    this.comments = [];
  }

  closePanels(): void {
    const routeDetails = getStore().getState().app.routeDetails;
    const queryParams = {...(routeDetails!.queryParams || {})};
    delete queryParams['comment_mode'];
    const stringParams: string = buildUrlQueryString(queryParams);
    const path: string = routeDetails!.path + (stringParams !== '' ? `?${stringParams}` : '');
    history.pushState(window.history.state, '', path);
    window.dispatchEvent(new CustomEvent('popstate'));
  }

  toggleMinimize(): void {
    this.minimized = !this.minimized;
    if (this.minimized) {
      this.dataset.minimized = '';
      this.closeCollection();
    } else {
      delete this.dataset.minimized;
    }
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
        :host([data-minimized]) messages-panel,
        :host([data-minimized]) comments-list {
          height: 64px;
        }
      `
    ];
  }
}
