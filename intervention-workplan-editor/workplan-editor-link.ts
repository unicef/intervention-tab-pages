import {LitElement, html, CSSResult, css, customElement, TemplateResult, property} from 'lit-element';

@customElement('workplan-editor-link')
export class WorkplanEditorLink extends LitElement {
  @property({type: String, reflect: true}) link = '';
  @property({type: String, reflect: true}) direction: 'right' | 'left' = 'left';
  protected render(): TemplateResult {
    return html`
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
        font-size: 15px;
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
