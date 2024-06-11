import {LitElement, html, CSSResult, css, TemplateResult} from 'lit';
import {property, customElement} from 'lit/decorators.js';

@customElement('workplan-editor-link')
export class WorkplanEditorLink extends LitElement {
  @property({type: String, reflect: true}) link = '';
  @property({type: String, reflect: true}) direction: 'right' | 'left' = 'left';
  @property({type: Boolean}) lowResolutionLayout = false;

  protected render(): TemplateResult {
    return html`
      <etools-media-query
        query="(max-width: 1080px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
          if (this.lowResolutionLayout) {
            this.goTo();
          }
        }}"
      ></etools-media-query>
      <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12L7 6.96208L12 2" stroke="#454545" stroke-width="2" stroke-linecap="square" />
        <path d="M7 12L2 6.96208L7 2" stroke="#454545" stroke-width="2" stroke-linecap="square" />
      </svg>

      <slot></slot>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', () => this.goTo());
  }

  private goTo(): void {
    if (this.link) {
      history.pushState(window.history.state, '', this.link);
      window.dispatchEvent(new CustomEvent('popstate'));
    }
  }

  static get styles(): CSSResult {
    // language=css
    return css`
      :host {
        display: flex;
        align-items: center;
        width: min-content;
        white-space: nowrap;
        font-family: Roboto;
        font-size: var(--etools-font-size-15, 15px);
        font-weight: 500;
        line-height: 18px;
        color: #5c5c5c;
        cursor: pointer;
      }
      :host(:hover) {
        color: #454545;
      }
      :host([direction='left']) svg {
        margin-right: 5px;
      }
      :host([direction='right']) svg {
        margin-left: 5px;
        transform: rotate(180deg);
      }
      :host([direction='right']) {
        flex-direction: row-reverse;
      }
    `;
  }
}
