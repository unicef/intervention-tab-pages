import {customElement, LitElement, html, CSSResultArray, TemplateResult, css, property} from 'lit-element';
import {InterventionComment} from '@unicef-polymer/etools-types';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
declare const dayjs: any;

@customElement('message-item')
export class MessageItem extends LitElement {
  @property({type: Boolean, reflect: true, attribute: 'my-comment'}) myComment!: boolean;
  @property() comment!: InterventionComment & {loadingError?: boolean; created: string};
  @property() resolving = false;
  @property() deleting = false;

  get authorAvatar(): string {
    return !this.comment
      ? ''
      : `${this.comment.user.first_name ? this.comment.user.first_name[0] : ''}${
          this.comment.user.last_name ? this.comment.user.last_name[0] : ''
        }`;
  }

  get date(): string {
    const date = dayjs(this.comment.created);
    return `${date.format('MMM DD YYYY')} at ${date.format('HH:mm')}`;
  }

  protected render(): TemplateResult {
    return html`
      <div class="info">
        <div class="avatar">${this.authorAvatar}</div>
        <div class="flex-c">
          <div class="name-and-phone">
            <div class="name">${this.comment.user.first_name} ${this.comment.user.last_name}</div>
            <etools-loading
              no-overlay
              ?active="${!this.comment.id && !this.comment.loadingError}"
              loading-text=""
            ></etools-loading>
            <div class="date" ?hidden="${!this.comment.id && !this.comment.loadingError}">
              ${this.comment.id
                ? this.date
                : html`<div class="retry" @click="${() => this.retry()}">
                    <iron-icon icon="refresh"></iron-icon>Retry
                  </div> `}
            </div>
          </div>

          ${this.comment.state === 'deleted'
            ? html`<div class="deleted-message">Message was deleted</div> `
            : html` <div class="message">${this.comment.text}</div>`}
        </div>
      </div>

      ${this.comment.state === 'deleted'
        ? html``
        : html`
            <div
              class="actions"
              ?hidden="${(!this.comment.id && !this.comment.loadingError) ||
              (!this.myComment && this.comment.state !== 'resolved')}"
            >
              <!--      Resolve action        -->
              <div
                @click="${() => this.resolve()}"
                class="${this.comment.state === 'resolved' ? 'resolved' : ''}"
                ?hidden="${!this.comment.id}"
              >
                <etools-loading no-overlay ?active="${this.resolving}" loading-text=""></etools-loading>
                <iron-icon
                  ?hidden="${this.resolving}"
                  class="resolve"
                  icon="${this.comment.state === 'resolved' ? 'check' : 'archive'}"
                ></iron-icon>
                Resolve${this.comment.state === 'resolved' ? 'd' : ''}
              </div>
              <!--      Delete action        -->
              <div ?hidden="${!this.myComment}" @click="${() => this.delete()}">
                <etools-loading no-overlay ?active="${this.deleting}" loading-text=""></etools-loading>
                <iron-icon ?hidden="${this.deleting}" class="delete" icon="delete"></iron-icon> Delete
              </div>
            </div>
          `}
    `;
  }

  resolve(): void {
    if (this.resolving || this.comment.state === 'resolved') {
      return;
    }
    fireEvent(this, 'resolve');
  }

  delete(): void {
    if (this.deleting) {
      return;
    }
    fireEvent(this, 'delete');
  }

  retry(): void {
    fireEvent(this, 'retry');
  }

  static get styles(): CSSResultArray {
    // language=css
    return [
      gridLayoutStylesLit,
      css`
        :host {
          display: flex;
          flex-direction: column;
          background: var(--primary-background-color);
          border-radius: 11px;
          padding: 12px;
          width: 83%;
          box-shadow: 0 4px 4px rgba(0, 0, 0, 0.12);
        }
        :host([my-comment]) {
          align-self: flex-end;
        }
        :host([my-comment]) .info .name-and-phone,
        :host([my-comment]) .info {
          flex-direction: row-reverse;
        }
        :host([my-comment]) .actions {
          flex-direction: row;
        }
        :host([my-comment]) .avatar {
          margin-right: 0;
          margin-left: 7px;
        }
        .avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
          width: 36px;
          height: 36px;
          margin-right: 7px;
          border-radius: 50%;
          background-color: var(--darker-divider-color);
          color: #ffffff;
          font-weight: 500;
          font-size: 18px;
          text-transform: uppercase;
        }
        .info {
          display: flex;
        }
        .info .name-and-phone {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .name {
          font-size: 14px;
          font-weight: 400;
          line-height: 16px;
          color: #212121;
        }
        .date {
          font-size: 13px;
          font-weight: 400;
          line-height: 15px;
          color: #5c5c5c;
        }
        .message {
          font-size: 16px;
          font-weight: 400;
          line-height: 20px;
          color: #5c5c5c;
          white-space: pre-line;
        }
        .deleted-message {
          font-size: 14px;
          line-height: 20px;
          color: var(--secondary-text-color);
          font-style: italic;
        }
        .actions {
          display: flex;
          align-items: center;
          flex-direction: row-reverse;
          justify-content: flex-end;
          padding-top: 8px;
          margin-top: 6px;
          border-top: 1px solid var(--light-divider-color);
        }
        .actions div {
          display: flex;
          align-items: center;
          margin-right: 30px;
          font-weight: 400;
          font-size: 16px;
          line-height: 18px;
          color: #5c5c5c;
          cursor: pointer;
        }
        .actions div.resolved:hover {
          text-decoration: none;
          cursor: default;
        }
        .actions div:hover {
          text-decoration: underline;
        }
        iron-icon {
          margin-right: 8px;
        }
        .delete {
          width: 18px;
          height: 18px;
          color: var(--primary-shade-of-red);
        }
        iron-icon[icon='refresh'],
        .resolve {
          width: 18px;
          height: 18px;
          color: var(--secondary-text-color);
        }
        *[hidden] {
          display: none !important;
        }
        etools-loading {
          width: 20px;
          margin-right: 8px;
        }
        .retry:hover {
          cursor: pointer;
          text-decoration: underline;
        }
        iron-icon[icon='refresh'] {
          margin-right: 2px;
        }
      `
    ];
  }
}