import {LitElement, property, html} from 'lit-element';
import {Constructor, AnyObject} from '../models/globals.types';
import cloneDeep from 'lodash-es/cloneDeep';
import {areEqual, filterByIds} from '../../utils/utils';
import {fireEvent} from '../../utils/fire-custom-event';
import {validateRequiredFields} from '../../utils/validation-helper';
import {formatDate} from '../../utils/date-utils';
import isEmpty from 'lodash-es/isEmpty';

function ComponentBaseMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ComponentBaseClass extends baseClass {
    @property({type: Boolean})
    editMode = false;

    @property({type: Boolean})
    canEditAtLeastOneField = false;

    @property({type: Object})
    originalData!: any;

    @property({type: Object})
    data: any = {};

    @property({type: Object})
    permissions!: any;

    set_canEditAtLeastOneField(editPermissions: AnyObject) {
      this.canEditAtLeastOneField = Object.keys(editPermissions).some((key: string) => editPermissions[key] === true);
    }

    hideEditIcon(editMode: boolean, canEdit: boolean) {
      return !canEdit || editMode;
    }

    hideActionButtons(editMode: boolean, canEdit: boolean) {
      if (!canEdit) {
        return true;
      }

      return !editMode;
    }

    isReadonly(editMode: boolean, canEdit: boolean) {
      return !(editMode && canEdit);
    }

    allowEdit() {
      this.editMode = true;
    }

    cancel() {
      this.data = cloneDeep(this.originalData);
      this.editMode = false;
    }

    validate() {
      return validateRequiredFields(this);
    }

    // To be implemented in child component
    saveData(): Promise<any> {
      return Promise.reject('Not Implemented');
    }

    save() {
      fireEvent(this, 'global-loading', {
        active: true,
        loadingSource: this.localName
      });
      this.saveData().finally(() => {
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: this.localName
        });
      });
    }

    renderActions(editMode: boolean, canEditAnyFields: boolean) {
      return this.hideActionButtons(editMode, canEditAnyFields)
        ? html``
        : html`
            <div class="layout-horizontal right-align row-padding-v">
              <paper-button class="default" @tap="${this.cancel}"> Cancel </paper-button>
              <paper-button class="primary" @tap="${this.save}"> Save </paper-button>
            </div>
          `;
    }

    renderEditBtn(editMode: boolean, canEditAnyFields: boolean) {
      return this.hideEditIcon(editMode, canEditAnyFields)
        ? html``
        : html` <paper-icon-button @tap="${this.allowEdit}" icon="create"> </paper-icon-button> `;
    }

    renderReadonlyUserDetails(users: AnyObject[], ids: string[]) {
      if (users == undefined) {
        return html`—`;
      }
      const selsectedUsers = filterByIds(users, ids);
      if (isEmpty(selsectedUsers)) {
        return html`—`;
      } else {
        return selsectedUsers.map((u: any) => {
          return html`<div class="w100">${this.renderNameEmailPhone(u)}</div>`;
        });
      }
    }

    renderNameEmailPhone(item: any) {
      // eslint-disable-next-line
      return html`${item.first_name} ${item.last_name} (${item.email ? item.email : ''}${item.phone ? ', ' + item.phone : ''})`;
    }

    selectedItemChanged(detail: any, key: string, optionValue = 'id') {
      if (!detail.selectedItem) {
        return;
      }
      const newValue = detail.selectedItem[optionValue];
      if (areEqual(this.data[key], newValue)) {
        return;
      }
      this.data[key] = newValue;
      this.requestUpdate();
    }

    dateHasChanged(detail: {date: Date}, key: string) {
      if (detail.date === undefined) {
        return;
      }
      const newValue = formatDate(detail.date, 'YYYY-MM-DD');
      if (areEqual(this.data[key], newValue)) {
        return;
      }
      this.data[key] = newValue;
      this.requestUpdate();
    }

    selectedItemsChanged(detail: any, key: string, optionValue = 'id') {
      if (detail.selectedItems === undefined) {
        return;
      }
      const newValues = detail.selectedItems.map((i: any) => i[optionValue]);
      /**
       * Event though requestUpdate checks hasChanged method,
       * it seems that it still re-renders even if the item hasn't really changed
       * Remove this line and render will be called infinitely
       */
      if (areEqual(this.data[key], newValues)) {
        return;
      }

      this.data[key] = newValues;

      /** Necessary because LitElement remembers the values used for last render
       *  and resetting the form on cancel won't work otherwise
       */
      this.requestUpdate();
    }

    valueChanged(detail: any, key: string) {
      if (areEqual(this.data[key], detail.value)) {
        return;
      }

      this.data[key] = detail.value;
      this.requestUpdate();
    }
  }
  return ComponentBaseClass;
}

export default ComponentBaseMixin;
