import {LitElement, property} from 'lit-element';
import {Constructor, AnyObject} from '../models/globals.types';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {fireEvent} from '../../utils/fire-custom-event';
import {cloneDeep} from '../../utils/utils';
import '../../common/layout/are-you-sure';
import {openDialog} from '../../utils/dialog';

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

    @property({type: Boolean})
    editMode!: boolean;

    @property({type: Object})
    dataSetModel!: AnyObject | null;

    private elToDeleteIndex!: number;

    async _openDeleteConfirmation(event: CustomEvent, index: number) {
      event.stopPropagation();
      if (!this.editMode) {
        return;
      }
      this.elToDeleteIndex = index;
      const confirmed = await openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          content: this.deleteConfirmationMessage,
          confirmBtnText: 'Yes'
        }
      }).then(({confirmed}) => {
        return confirmed;
      });

      this._onDeleteConfirmation(confirmed);
    }

    public _onDeleteConfirmation(confirmed: boolean) {
      if (confirmed) {
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
      const duplicateItems =
        this.dataItems &&
        this.dataItems.filter((item, index) => {
          return parseInt(item[itemValueName]) === parseInt(selValue) && parseInt(String(index)) !== parseInt(selIndex);
        });
      return duplicateItems && duplicateItems.length;
    }

    public _emptyList(listLength: number) {
      return listLength === 0;
    }

    public _getItemModelObject(addNull: any) {
      if (addNull) {
        return null;
      }
      if (this.dataSetModel === null) {
        const newObj: AnyObject = {};
        if (this.dataItems.length > 0 && typeof this.dataItems[0] === 'object') {
          Object.keys(this.dataItems[0]).forEach(function (property) {
            newObj[property] = ''; // (this.model[0][property]) ? this.model[0][property] :
          });
        }

        return newObj;
      } else {
        return JSON.parse(JSON.stringify(this.dataSetModel));
      }
    }

    public _addElement(addNull?: boolean) {
      if (!this.editMode) {
        return;
      }
      this._makeSureDataItemsAreValid();

      const newObj = this._getItemModelObject(addNull);
      this.dataItems = [...this.dataItems, newObj];
    }

    /**
     * Check is dataItems is Array, if not init with empty Array
     */
    public _makeSureDataItemsAreValid(dataItems?: any) {
      const items = dataItems ? dataItems : this.dataItems;
      if (!Array.isArray(items)) {
        this.dataItems = [];
      }
    }
  }

  return RepeatableDataSetsClass;
}

export default RepeatableDataSetsMixin;
