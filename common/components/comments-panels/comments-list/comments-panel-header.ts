import {LitElement, html, TemplateResult, CSSResultArray} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {CommentPanelsStyles} from '../common-comments.styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {translate} from 'lit-translate';
import {fitCommentsToWindow, makeCommentsDraggable} from '../../comments/comments.helpers';

@customElement('comments-panel-header')
/* eslint-disable max-len */
export class CommentsPanelHeader extends LitElement {
  @property() count = 0;
  @property() isExpanded = false;
  protected render(): TemplateResult {
    return html`
      <div>${translate('COMMENTS_PANEL')} <b>(${this.count})</b></div>
      <div class="buttons">
        <paper-button tabindex="0" @click="${() => this.toggleMinimize()}">
          <iron-icon icon="${this.isExpanded ? 'unfold-more' : 'unfold-less'}"></iron-icon>
        </paper-button>

        <paper-button tabindex="0" @click="${() => this.closePanel()}">
          <iron-icon icon="close"></iron-icon>
        </paper-button>
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('mousedown', makeCommentsDraggable);
    this.addEventListener('touchstart', makeCommentsDraggable);
    window.addEventListener('resize', fitCommentsToWindow);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('resize', fitCommentsToWindow);
  }

  closePanel(): void {
    fireEvent(this, 'close-comments-panels');
  }

  toggleMinimize(): void {
    this.isExpanded = !this.isExpanded;
    fireEvent(this, 'toggle-minimize');
  }

  static get styles(): CSSResultArray {
    // language=css
    return [CommentPanelsStyles];
  }
}
