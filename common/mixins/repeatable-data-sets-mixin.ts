import {LitElement, property} from 'lit-element';
import {Constructor} from '../models/globals.types';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {createDynamicDialog, removeDialog} from '@unicef-polymer/etools-dialog/dynamic-dialog';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {fireEvent} from '../../utils/fire-custom-event';
import {cloneDeep} from '../../utils/utils';

function RepeatableDataSetsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class RepeatableDataSetsClass extends baseClass {
    @property({type: String})
    deleteConfirmationTitle = 'Delete confirmation';

    @property({type: String})
    deleteConfirmationMessage = 'Are you sure you want to delete this item?';

    @property({type: String})
    deleteActionLoadingMsg = 'Deleting items from server...';

    @property({type: String})
    deleteLoadingSource = 'delete-data-set';

    @property({type: String})
    deleteActionDefaultErrMsg = 'Deleting items from server action has failed!';

    @property({type: Array})
    dataItems!: any[];

    private _deleteDialog!: EtoolsDialog;
    private elToDeleteIndex!: number;

    public connectedCallback() {
      super.connectedCallback();
      // create delete confirmation dialog
      this._createDeleteConfirmationDialog();
    }

    public disconnectedCallback() {
      super.disconnectedCallback();
      // remove delete confirmation dialog when the element is detached
      this._deleteDialog.removeEventListener('close', this._onDeleteConfirmation);
      removeDialog(this._deleteDialog);
    }

    public _openDeleteConfirmation(event: CustomEvent, index: number) {
      event.stopPropagation();
      if (!this.editMode) {
        return;
      }
      this.elToDeleteIndex = index;
      this._deleteDialog.opened = true;
    }

    public _createDeleteConfirmationDialog() {
      const deleteConfirmationContent = document.createElement('div');
      deleteConfirmationContent.innerHTML = this.deleteConfirmationMessage;
      this._onDeleteConfirmation = this._onDeleteConfirmation.bind(this);

      this._deleteDialog = createDynamicDialog({
        title: this.deleteConfirmationTitle,
        size: 'md',
        okBtnText: 'Yes',
        cancelBtnText: 'No',
        closeCallback: this._onDeleteConfirmation,
        content: deleteConfirmationContent
      });
    }

    public _onDeleteConfirmation(event: any) {
      this._deleteDialog.opened = false;
      if (event.detail.confirmed === true) {
        const id = this.dataItems[this.elToDeleteIndex] ? this.dataItems[this.elToDeleteIndex].id : null;

        if (id) {
          // @ts-ignore
          if (!this._deleteEpName) {
            // logError('You must define _deleteEpName property to be able to remove existing records');
            return;
          }

          fireEvent(this, 'global-loading', {
            message: this.deleteActionLoadingMsg,
            active: true,
            loadingSource: this.deleteLoadingSource
          });

          // @ts-ignore
          let endpointParams = {id: id};
          // @ts-ignore
          if (this.extraEndpointParams) {
            // @ts-ignore
            endpointParams = {...endpointParams, ...this.extraEndpointParams};
          }
          // @ts-ignore
          const deleteEndpoint = this.getEndpoint(this._deleteEpName, endpointParams);
          sendRequest({
            method: 'DELETE',
            endpoint: deleteEndpoint,
            body: {}
          })
            .then((_resp: any) => {
              this._handleDeleteResponse();
            })
            .catch((error: any) => {
              this._handleDeleteError(error.response);
            });
        } else {
          this._deleteElement();
          this.elToDeleteIndex = -1;
        }
      } else {
        this.elToDeleteIndex = -1;
      }
    }

    public _handleDeleteResponse() {
      this._deleteElement();
      this.elToDeleteIndex = -1;
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: this.deleteLoadingSource
      });
    }

    public _handleDeleteError(responseErr: any) {
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: this.deleteLoadingSource
      });

      let msg = this.deleteActionDefaultErrMsg;
      if (responseErr instanceof Array && responseErr.length > 0) {
        msg = responseErr.join('\n');
      } else if (typeof responseErr === 'string') {
        msg = responseErr;
      }
      fireEvent(this, 'toast', {text: msg, showCloseBtn: true});
    }

    public _deleteElement() {
      if (!this.editMode) {
        return;
      }
      const index = Number(this.elToDeleteIndex);
      if (index >= 0) {
        this.dataItems.splice(index, 1);
        // To mke sure all req. observers are triggered
        this.dataItems = cloneDeep(this.dataItems);

        fireEvent(this, 'delete-confirm', {index: this.elToDeleteIndex});
      }
    }

    /**
     * selValue - the just selected value or id
     * selIndex - the index of the selected data item
     * itemValueName - the name of property to compare selValue against
     */
    public isAlreadySelected(selValue: any, selIndex: any, itemValueName: any) {
      const duplicateItems = this.dataItems.filter((item, index) => {
        return parseInt(item[itemValueName]) === parseInt(selValue) && parseInt(String(index)) !== parseInt(selIndex);
      });
      return duplicateItems && duplicateItems.length;
    }

    public _emptyList(listLength: number) {
      return listLength === 0;
    }
  }
  return RepeatableDataSetsClass;
}

export default RepeatableDataSetsMixin;
