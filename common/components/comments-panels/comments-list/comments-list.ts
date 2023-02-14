import {customElement, LitElement, html, TemplateResult, CSSResultArray, property} from 'lit-element';
import {CommentPanelsStyles} from '../common-comments.styles';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import './comments-group';
import './comments-panel-header';
import {CommentsCollection} from '../../comments/comments.reducer';
import {CommentsDescription, CommentsItemsNameMap} from '../../comments/comments-items-name-map';
import {removeTrailingIds} from '../../comments/comments.helpers';

export type CommentItemData = {
  relatedTo: string;
  // translate key that describes type of element - Budget Summary/Attachments/PD Output after translate
  relatedToTranslateKey: string;
  // comments count
  count: number;
  // description provided by [comment-element] or [comment-container]
  // (Now like name for activity/indicator/pd or prp tab type)
  relatedToDescription: string;
  // translate key for regular tabs that hasn't provided description (relatedToDescription)
  // would be taken from CommentsDescription mapping
  fieldDescription: string | null;
  lastCreatedMessageDate: string | null;
};

@customElement('comments-list')
export class CommentsList extends LitElement {
  @property() selectedGroup: string | null = null;
  set commentsCollection(collection: CommentsCollection) {
    this.commentsGroups = Object.entries(collection || {}).map(([relatedTo, comments]) => {
      const relatedToKey: string = removeTrailingIds(relatedTo);
      const relatedToTranslateKey = CommentsItemsNameMap[relatedToKey];
      const commentWithDescription = comments.find(({related_to_description}) => related_to_description);
      const relatedToDescription = commentWithDescription?.related_to_description || '';
      const fieldDescription = CommentsDescription[relatedToKey] || null;
      return {
        relatedToTranslateKey,
        relatedToDescription,
        fieldDescription,
        relatedTo,
        count: comments.length,
        lastCreatedMessageDate: (comments[comments.length - 1] as any).created
      };
    });
    this.requestUpdate();
  }

  commentsGroups: CommentItemData[] = [];

  protected render(): TemplateResult {
    return html`
      <comments-panel-header .count="${this.commentsGroups.length}"></comments-panel-header>
      <div class="data-container">
        ${this.commentsGroups.map((group) => {
          return html`
            <comments-group
              ?opened="${group.relatedTo === this.selectedGroup}"
              .relatedTo="${group.relatedToTranslateKey}"
              .relatedToDescription="${group.relatedToDescription}"
              .fieldDescription="${group.fieldDescription}"
              .commentsCount="${group.count}"
              .lastCreatedMessageDate="${group.lastCreatedMessageDate}"
              tabindex="0"
              @click="${() => this.showMessages(group)}"
              @keyup="${(event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                  this.showMessages(group);
                  const commentsPanelElement = document.querySelector('comments-panels');
                  const messagesPanelElement = commentsPanelElement?.shadowRoot?.querySelector('messages-panel');
                  messagesPanelElement?.shadowRoot?.querySelector('paper-textarea')?.focus();
                }
              }}"
            ></comments-group>
          `;
        })}
      </div>
    `;
  }

  showMessages(commentsGroup: CommentItemData): void {
    fireEvent(this, 'show-messages', {commentsGroup});
  }

  static get styles(): CSSResultArray {
    // language=css
    return [CommentPanelsStyles];
  }
}
