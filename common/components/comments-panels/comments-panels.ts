import {customElement, LitElement, html, TemplateResult, CSSResultArray, css, property} from 'lit-element';
import './comments-list/comments-list';
import './messages-panel/messages-panel';
import {CommentPanelsStyles} from './common-comments.styles';

@customElement('comments-panels')
export class CommentsPanels extends LitElement {
  @property() messagesOpened = false;
  protected render(): TemplateResult {
    return html`
      <comments-list @show-messages="${() => (this.messagesOpened = true)}"></comments-list>
      <messages-panel
        class="${this.messagesOpened ? 'opened' : ''}"
        @hide-messages="${() => (this.messagesOpened = false)}"
      ></messages-panel>
    `;
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
          z-index: 9999;
          margin: 0 18px;
          width: calc(100% - 36px);
          max-width: 450px;
        }
      `
    ];
  }
}
