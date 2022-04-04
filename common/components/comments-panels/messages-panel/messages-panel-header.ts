import {customElement, LitElement, html, TemplateResult, CSSResultArray} from 'lit-element';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {CommentPanelsStyles} from '../common-comments.styles';

@customElement('messages-panel-header')
export class MessagesPanelHeader extends LitElement {
  protected render(): TemplateResult {
    return html`
      <div>Comments on <b>section 3</b></div>
      <div class="buttons">
        <svg
          @click="${this.hideMessages}"
          width="14"
          height="23"
          viewBox="0 0 14 23"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 3L11 11.5645L3 20" stroke="white" stroke-width="3" stroke-linecap="square" />
        </svg>
      </div>
    `;
  }

  hideMessages(): void {
    fireEvent(this, 'hide-messages');
  }

  static get styles(): CSSResultArray {
    // language=css
    return [CommentPanelsStyles];
  }
}
