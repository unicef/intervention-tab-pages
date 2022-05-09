import {Constructor} from '@unicef-polymer/etools-types';
import {CSSResultArray, html, LitElement, TemplateResult, css} from 'lit-element';
import {PaperButtonElement} from '@polymer/paper-button/paper-button';

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
      return html`${string.substring(0, this.amountOfFirstLetters)}<paper-button
          class="show-more-btn"
          id="show-more"
          @click="${(event: CustomEvent) => this.showMore(event)}"
          >...</paper-button
        ><span hidden aria-hidden>${string.substring(60, string.length)}</span> `;
    }

    private showMore(event: CustomEvent) {
      const paperBtn = event.target as PaperButtonElement;
      paperBtn.setAttribute('hidden', '');
      const truncatedText = paperBtn.nextElementSibling;
      truncatedText?.removeAttribute('hidden');
      truncatedText?.removeAttribute('aria-hidden');
    }

    static get styles(): CSSResultArray {
      return [
        css`
          .show-more-btn {
            margin: 0;
            padding: 0;
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
