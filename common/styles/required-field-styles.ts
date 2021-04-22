import {html, htmlLiteral} from '@polymer/polymer/lib/utils/html-tag.js';
import {ROOT_PATH} from '../../config/config';

const baseUrlData: ReadonlyArray<string> = [ROOT_PATH];
const baseUrl = htmlLiteral(baseUrlData as TemplateStringsArray);

// language=HTML
export const requiredFieldStarredStylesPolymer = html` <style>
  :host > * {
    --required-star-style: {
      background: url(${baseUrl}'/images/required.svg') no-repeat 99% 20%/8px;
      width: auto !important;
      max-width: 100%;
      right: auto;
      padding-right: 15px;
    }
  }

  paper-input[required][label],
  paper-input-container[required],
  datepicker-lite[required],
  etools-upload[required],
  etools-currency-amount-input[required] {
    --paper-input-container-label: {
      @apply --required-star-style;
      color: var(--secondary-text-color, #737373);
    }
    --paper-input-container-label-floating: {
      @apply --required-star-style;
      color: var(--secondary-text-color, #737373);
    }
  }

  etools-dropdown-multi[required]::part(esmm-label),
  etools-dropdown[required]::part(esmm-label) {
    @apply --required-star-style;
  }
</style>`;
