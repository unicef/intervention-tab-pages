import {LitElement, html, TemplateResult, CSSResultArray, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {CommentPanelsStyles} from '../common-comments.styles';
import {translate, get as getTranslation} from 'lit-translate';
import {makeCommentsDraggable} from '../../comments/comments.helpers';
import {CommentRelatedItem} from '../../comments/comments-types';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';

@customElement('messages-panel-header')
export class MessagesPanelHeader extends LitElement {
  @property() relatedToKey = '';
  @property() relatedItem: CommentRelatedItem | null = null;

  protected render(): TemplateResult {
    return html`
      <div>
        ${getTranslation('COMMENTS_ON')}
        <b>${this.relatedToKey ? translate(this.relatedToKey) : ''} ${this.relatedItem?.code || ''}</b>
      </div>
      <div class="buttons">
        <sl-icon-button name="chevron-right" @click="${() => this.hideMessages(false)}"> </sl-icon-button>
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('mousedown', makeCommentsDraggable);
    this.addEventListener('touchstart', makeCommentsDraggable);
    document.addEventListener('keydown', this.hideOnEscape.bind(this));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.hideOnEscape.bind(this));
  }

  hideOnEscape(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.hideMessages(true);
    }
  }

  hideMessages(refocusInList?: boolean): void {
    if (refocusInList) {
      const commentsPanelElement = document.querySelector('comments-panels');
      const commentsListElement = commentsPanelElement?.shadowRoot?.querySelector('comments-list');
      (commentsListElement?.shadowRoot?.querySelector('comments-group[opened]') as any)?.focus();
    }
    fireEvent(this, 'hide-messages');
  }

  static get styles(): CSSResultArray {
    // language=css
    return [
      CommentPanelsStyles,
      css`
        sl-icon-button {
          font-size: 1.5em;
          stroke: white;
        }
      `
    ];
  }
}
