import {customElement, LitElement, html, TemplateResult, css, CSSResultArray, property} from 'lit-element';
import {CommentPanelsStyles} from '../common-comments.styles';
import './messages-panel-header';
import './message-item';
import {translate} from 'lit-translate';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';

@customElement('messages-panel')
export class MessagesPanel extends LitElement {
  @property() newMessageText = '';
  @property() comment = {
    id: 1,
    user: {
      id: 3739,
      name: 'John Doe',
      first_name: 'John',
      middle_name: '',
      last_name: 'Doe'
    },
    users_related: [],
    text: 'Please check if the amunt of cash is correct. It doesn’t seem like it is at the moment',
    state: 'active',
    created: '2022-04-04T10:25:47.043401Z',
    related_to_description: '',
    related_to: 'budget-summary'
  };
  protected render(): TemplateResult {
    return html`
      <style>
        etools-dialog::part(ed-scrollable) {
          margin-top: 0 !important;
        }
        paper-textarea {
          outline: none;
          flex: auto;
          --paper-input-container-input: {
            display: block;
          }
        }
      </style>
      <messages-panel-header></messages-panel-header>
      <div class="data-container layout-vertical">
        <div class="messages">
          <message-item .comment="${this.comment}" my-comment></message-item>
          <message-item .comment="${this.comment}"></message-item>
        </div>

        <div class="message-input">
          <paper-textarea
            max-rows="3"
            no-label-float
            placeholder="${translate('GENERAL.ENTER_MESSAGE_HERE')}"
            .value="${this.newMessageText}"
            @value-changed="${({detail}: CustomEvent) => {
              this.newMessageText = detail.value;
              this.requestUpdate();
            }}"
            @keyup="${(event: KeyboardEvent) => this.onKeyup(event)}"
            @keydown="${(event: KeyboardEvent) => this.onKeydown(event)}"
          ></paper-textarea>
          <paper-button class="send-btn" @click="${() => this.addComment()}">Post</paper-button>
        </div>
      </div>
    `;
  }

  onKeyup(event: KeyboardEvent): void {
    if (event.key !== 'Enter') {
      // this.updateHeight();
      return;
    }
    if (event.ctrlKey) {
      this.newMessageText += '\n';
      this.requestUpdate();
      // this.updateHeight();
    } else {
      this.addComment();
    }
  }

  addComment(): void {}

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.ctrlKey) {
      event.preventDefault();
    }
  }

  static get styles(): CSSResultArray {
    // language=css
    return [
      gridLayoutStylesLit,
      CommentPanelsStyles,
      css`
        :host {
          transition: 0.5s;
          z-index: 10 !important;
          box-shadow: 0 4px 10px 3px rgba(0, 0, 0, 0) !important;
        }
        :host(.opened) {
          box-shadow: 0 4px 10px 3px rgba(0, 0, 0, 0.17) !important;
          transform: translateX(calc(-100% + 28px));
          padding-right: 18px;
        }
        .data-container {
          padding-right: 10px;
        }
        .messages {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px 40px 16px 22px;
          background-color: #dff1ef;
        }
        .message-input {
          display: flex;
          align-items: flex-end;
          padding: 12px 20px 11px 25px;
          border-top: 1px solid var(--light-divider-color);
          margin-bottom: 0;
        }
        .send-btn {
          background: #009688;
          height: 36px;
          margin-bottom: 7px;
          color: #ffffff;
          margin-left: 8px;
        }
      `
    ];
  }
}
