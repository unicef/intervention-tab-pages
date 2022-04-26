import {LitElement, html, TemplateResult, CSSResultArray, customElement, property} from 'lit-element';
import '@polymer/iron-icons';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {CommentStyles} from './comment.styles';
import {InterventionComment} from '@unicef-polymer/etools-types';
declare const dayjs: any;

@customElement('comment-element')
export class CommentElement extends LitElement {
  static get styles(): CSSResultArray {
    // language=css
    return [CommentStyles];
  }

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
      <div class="avatar">${this.authorAvatar}</div>
      <div class="info">
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
          : html`
              <div class="message">${this.comment.text}</div>
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
                  <iron-icon ?hidden="${this.deleting}" class="delete" icon="cancel"></iron-icon> Delete
                </div>
              </div>
            `}
      </div>
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
}
