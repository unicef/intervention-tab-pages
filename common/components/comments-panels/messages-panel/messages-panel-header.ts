import {customElement, LitElement, html, TemplateResult, CSSResultArray, property} from 'lit-element';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {CommentPanelsStyles} from '../common-comments.styles';
import {translate, get as getTranslation} from 'lit-translate';
import {makeCommentsDraggable} from '../../comments/comments.helpers';

@customElement('messages-panel-header')
export class MessagesPanelHeader extends LitElement {
  @property() relatedToKey = '';
  protected render(): TemplateResult {
    return html`
      <div>${getTranslation('COMMENTS_ON')} <b>${this.relatedToKey ? translate(this.relatedToKey) : ''}</b></div>
      <div class="buttons">
        <svg
          @click="${this.hideMessages}"
          @keyup="${(event: KeyboardEvent) => {
            if (event.key === 'Enter') {
              this.hideMessages(true);
            }
          }}"
          width="14"
          height="23"
          viewBox="0 0 14 23"
          fill="none"
          tabindex="0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 3L11 11.5645L3 20" stroke="white" stroke-width="3" stroke-linecap="square" />
        </svg>
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
    return [CommentPanelsStyles];
  }
}
