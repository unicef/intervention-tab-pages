import {customElement, LitElement, html, TemplateResult, CSSResultArray} from 'lit-element';
import {CommentPanelsStyles} from '../common-comments.styles';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import './comments-group';
import './comments-panel-header';

@customElement('comments-list')
export class CommentsList extends LitElement {
  protected render(): TemplateResult {
    return html`
      <comments-panel-header></comments-panel-header>
      <div class="data-container">
        <comments-group @click="${this.showMessages}"></comments-group>
        <comments-group></comments-group>
        <comments-group></comments-group>
        <comments-group></comments-group>
      </div>
    `;
  }

  showMessages(): void {
    fireEvent(this, 'show-messages');
  }

  static get styles(): CSSResultArray {
    // language=css
    return [CommentPanelsStyles];
  }
}
