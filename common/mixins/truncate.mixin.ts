import {Constructor} from '@unicef-polymer/etools-types';
import {CSSResultArray, html, LitElement, TemplateResult, css} from 'lit';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import SlButton from '@shoelace-style/shoelace/dist/components/button/button.js';

export function TruncateMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class Truncate extends baseClass {
    amountOfFirstLetters = 60;

    truncateString(string: string): TemplateResult {
      // @ts-ignore
      if ([null, undefined].includes(string)) {
        return html``;
      }
      if (string.length <= this.amountOfFirstLetters) {
        return html`${string}`;
      }
      return html`${string.substring(0, this.amountOfFirstLetters)}<sl-button
          variant="text"
          class="no-marg no-pad show-more-btn"
          id="show-more"
          @click="${(event: CustomEvent) => this.showMore(event)}"
          >...</sl-button
        ><span hidden aria-hidden>${string.substring(60, string.length)}</span> `;
    }

    private showMore(event: CustomEvent) {
      const slBtn = event.target as SlButton;
      slBtn.setAttribute('hidden', '');
      const truncatedText = slBtn.nextElementSibling;
      truncatedText?.removeAttribute('hidden');
      truncatedText?.removeAttribute('aria-hidden');
    }

    static get styles(): CSSResultArray {
      return [
        css`
          .show-more-btn {
            --sl-input-height-medium: 24px;
            max-height: 24px;
          }
          .show-more-btn::part(base) {
            margin: 0px;
            padding: 0px;
            min-width: 15px;
            font-weight: bold;
            color: var(--primary-color);
            background-color: transparent;
          }
        `
      ];
    }
  };
}
