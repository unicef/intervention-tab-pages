import {LitElement, property, html, customElement} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import {fireEvent} from '../../utils/fire-custom-event';
import {AnyObject} from '@unicef-polymer/etools-types';

/**
 * @customElement
 */
@customElement('icons-actions')
export class IconsActions extends LitElement {
  render() {
    return html`
      <style>
        [hidden] {
          display: none !important;
        }

        :host {
          display: -ms-flexbox;
          display: -webkit-flex;
          display: flex;
          -ms-flex-direction: row;
          -webkit-flex-direction: row;
          flex-direction: row;
          -ms-flex-align: center;
          -webkit-align-items: center;
          align-items: center;
          background-color: var(--list-second-bg-color);
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
        }

        paper-icon-button {
          color: var(--dark-icon-color, #6f6f70);
        }
      </style>

      <paper-icon-button ?hidden="${!this.showEdit}" icon="create" @click="${this._onEdit}"></paper-icon-button>
      <paper-icon-button ?hidden="${!this.showDelete}" icon="delete" @click="${this._onDelete}"></paper-icon-button>
      <paper-icon-button
        ?hidden="${!this.showDeactivate}"
        icon="block"
        @click="${this._onDeactivate}"
      ></paper-icon-button>
    `;
  }

  @property({type: Object})
  itemDetails!: AnyObject;

  @property({type: Boolean})
  showEdit = true;

  @property({type: Boolean})
  showDelete = true;

  @property({type: Boolean})
  showDeactivate = false;

  _onEdit() {
    fireEvent(this, 'edit');
  }

  _onDelete() {
    fireEvent(this, 'delete');
  }

  _onDeactivate() {
    fireEvent(this, 'deactivate');
  }
}
