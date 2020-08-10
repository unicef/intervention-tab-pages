/* eslint-disable lit/no-legacy-template-syntax */
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-icon-button/paper-icon-button';

// @lajos TO DO refactor
import {property} from '@polymer/decorators';
import {AnyObject} from '../models/globals.types';
import {fireEvent} from '../../utils/fire-custom-event';

/**
 * @polymer
 * @customElement
 */
class IconsActions extends PolymerElement {
  static get template() {
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
          background-color: var(--list-second-bg-color);
          position: absolute;
          top: 1px;
          right: 0;
          bottom: 1px;

          @apply --icons-actions;
        }

        paper-icon-button {
          color: var(--dark-icon-color, #6f6f70);
        }
      </style>

      <paper-icon-button hidden$="[[!showEdit]]" icon="create" on-tap="_onEdit"></paper-icon-button>
      <paper-icon-button hidden$="[[!showDelete]]" icon="delete" on-tap="_onDelete"></paper-icon-button>
      <paper-icon-button hidden$="[[!showDeactivate]]" icon="block" on-tap="_onDeactivate"></paper-icon-button>
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

window.customElements.define('icons-actions', IconsActions);

export {IconsActions as IconsActionsEl};
