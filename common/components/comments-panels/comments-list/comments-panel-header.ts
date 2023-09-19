import {LitElement, html, TemplateResult, CSSResultArray, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {CommentPanelsStyles} from '../common-comments.styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {translate} from 'lit-translate';
import {fitCommentsToWindow, makeCommentsDraggable} from '../../comments/comments.helpers';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';

@customElement('comments-panel-header')
/* eslint-disable max-len */
export class CommentsPanelHeader extends LitElement {
  @property() count = 0;
  @property() isExpanded = false;
  protected render(): TemplateResult {
    return html`
      <div>${translate('COMMENTS_PANEL')} <b>(${this.count})</b></div>
      <div class="buttons">
        <sl-icon-button
          @click="${() => this.toggleMinimize()}"
          name="${this.isExpanded ? 'arrows-expand' : 'arrows-collapse'}"
        >
        </sl-icon-button>

        <sl-icon-button name="x-lg" @click="${() => this.closePanel()}"> </sl-icon-button>
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
