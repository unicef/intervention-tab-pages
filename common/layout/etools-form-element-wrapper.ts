import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-input/paper-input-container';
import {sharedStyles} from '../styles/shared-styles-lit';

/**
 * @customElement
 */
@customElement('etools-form-element-wrapper')
export class EtoolsFormElementWrapper extends LitElement {
  render() {
    return html`
      <style>
        ${sharedStyles} :host {
          width: 100%;

          max-width: var(--etools-form-element-wrapper-max-width, none);
          --paper-input-container-underline: {
            display: none;
          }
          --paper-input-container-underline-focus: {
            display: none;
          }
          --paper-input-container-underline-disabled: {
            display: none;
          }
          --paper-input-prefix: {
            margin-right: 5px;
            margin-top: -2px;
            color: var(--dark-secondary-text-color);
          }
        }

        :host(.right-align) paper-input-container {
          text-align: right;
        }

        .paper-input-input {
          display: flex;
          flex-direction: row;
          display: inline-block;
          word-wrap: break-word;
        }

        :host(.ie) .paper-input-input {
          display: inline-block;
        }

        :host(.ie) .input-value {
          line-height: 24px;
        }

        .placeholder {
          color: var(--secondary-text-color, rgba(0, 0, 0, 0.54));
        }
      </style>
      <paper-input-container
        ?always-float-label="${this.alwaysFloatLabel}"
        ?no-label-float="${this.noLabelFloat}"
        ?required="${this.required}"
      >
        <label ?hidden="${!this.label}" slot="label">${this.label}</label>
        <slot name="prefix" slot="prefix"></slot>
        <div slot="input" class="paper-input-input">
          <span .class="input-value ${this._getPlaceholderClass(this.value)}"
            >${this._getDisplayValue(this.value)}</span
          >
          <slot></slot>
        </div>
      </paper-input-container>
    `;
  }

  @property({type: String})
  label!: string;

  @property({type: String})
  value = '';

  @property({type: Boolean})
  alwaysFloatLabel = true;

  @property({type: Boolean})
  noLabelFloat!: boolean;

  @property({type: Boolean})
  required!: boolean;

  @property({type: Boolean})
  noPlaceholder = false;

  _getPlaceholderClass(value: string) {
    const cssclass = typeof value === 'string' && value.trim() !== '' ? '' : this.noPlaceholder ? '' : 'placeholder';
    return cssclass + ' etools-form-element-wrapper';
  }

  _getDisplayValue(value: string) {
    return typeof value === 'string' && value.trim() !== ''
      ? value == '-'
        ? 'N/A'
        : value.trim()
      : this.noPlaceholder
      ? ''
      : '—';
  }
}
