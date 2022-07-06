import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {User} from '@unicef-polymer/etools-types';
import {customElement, html, LitElement, property} from 'lit-element';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-icon-button/paper-icon-button';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {areEqual, cloneDeep} from '@unicef-polymer/etools-modules-common/dist/utils/utils';

@customElement('partner-focal-points')
export class PartnerFocalPoints extends LitElement {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  public render() {
    return html`
      ${sharedStyles}
      <style>
        paper-icon-button {
          flex: none;
        }
        --paper-input-container-input: {
          display: block;
        }
        --paper-input-container-shared-input-style: {
          width: 100%;
        }
      </style>
      ${this.items?.map(
        (item: string, index: number) => html`
          <div class="layout-horizontal">
            <paper-input
              no-label-float
              style="flex:1;"
              .value="${item}"
              type="email"
              auto-validate
              ?readonly="${!this.editMode}"
              @value-changed="${(e: CustomEvent) => {
                if (e.detail.value !== item) {
                  this.items[index] = e.detail.value;
                  this.waitForValidation((target: any) => {
                    if (!(target as PaperInputElement).invalid) {
                      fireEvent(this, 'items-changed', {items: this.cleanUpEmptyItems(this.items)});
                    }
                  }, e.target);
                }
              }}"
              error-message="Please enter a valid email"
            >
            </paper-input>

            ${this.items.length === index + 1 && this.editMode
              ? html`<paper-icon-button @click="${() => this.addNewInput()}" icon="add-box"> </paper-icon-button>`
              : html``}
          </div>
        `
      )}
    `;
  }

  _user!: User;
  @property({type: Object})
  get user() {
    return this._user;
  }

  set user(val: any) {
    this._user = val;
    if ((!this.items || this.items.length === 0) && this.onAddPage) {
      this.items = [this.user.email];
    }
  }

  _onAddPage = false;
  @property({type: Boolean, reflect: true})
  get onAddPage() {
    return this._onAddPage;
  }

  set onAddPage(val: boolean) {
    this._onAddPage = val;
    this.editMode = true;
  }

  @property({type: Boolean})
  editMode = false;

  _items!: string[];
  @property({type: Array})
  get items() {
    return this._items;
  }

  set items(val: string[]) {
    if (val.length === 0 && this.onAddPage && this.user) {
      this._items = [this.user.email]; // Current user email has to be part of focal points
    }
    if (!areEqual(this._items, val)) {
      this._items = val;
    }
  }

  addNewInput() {
    this.items.push('');
    this.requestUpdate();
  }

  cleanUpEmptyItems(items: string[]) {
    if (!items || !items.length) {
      return;
    }
    const cleanedItems = cloneDeep(items);
    let indexToRemove = -1;
    const thereAreEmptyItems = () =>
      cleanedItems.findIndex((i: string, index: number) => {
        if (i === '') {
          indexToRemove = index;
          return true;
        }
        return false;
      });
    while (thereAreEmptyItems() !== -1) {
      cleanedItems.splice(indexToRemove, 1);
    }
    return cleanedItems;
  }

  validate() {
    const emails = this.shadowRoot?.querySelectorAll<PaperInputElement>('paper-input[type="email"]');
    let valid = true;
    emails?.forEach((e) => {
      if (!e.validate()) {
        valid = false;
      }
    });
    return valid;
  }

  waitForValidation(func: any, target: any) {
    setTimeout(() => func(target), 200);
  }
}
