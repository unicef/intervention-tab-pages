import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';

import {PaperInputElement} from '@polymer/paper-input/paper-input.js';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {LitElement, html, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../../../common/styles/grid-layout-styles-lit';
import {AnyObject, Disaggregation} from '../../../../common/models/globals.types';
import {flaggedSortedDisaggregs} from '../../redux/selectors';
import {getStore} from '../../../../utils/redux-store-access';
import {repeatableDataSetsStyles} from '../../../../common/styles/repeatable-data-sets-styles';
import {buttonsStyles} from '../../../../common/styles/button-styles';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {sharedStyles} from '../../../../common/styles/shared-styles-lit';
import '../../../../common/layout/are-you-sure';
import {openDialog} from '../../../../utils/dialog';
import {getEndpoint} from '../../../../utils/endpoint-helper';
import {interventionEndpoints} from '../../../../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {cloneDeep} from '../../../../utils/utils';

/**
 * @customElement
 * @applies MixinRepeatableDataSets
 */
@customElement('indicator-dissaggregations')
export class IndicatorDisaggregations extends LitElement {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    return html`
      ${repeatableDataSetsStyles}
      <style>
        ${sharedStyles} [hidden] {
          display: none !important;
        }

        :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
        }

        paper-input {
          width: 100%;
        }
      </style>
      <div ?hidden="${this._isEmptyList(this.dataItems, this.dataItems.length)}">
        ${this.dataItems.map(
          (item: any, index: number) => html` <div class="row-h item-container no-h-margin">
            <div class="item-actions-container">
              <div class="actions">
                <paper-icon-button
                  class="action delete"
                  @click="${(e: CustomEvent) => this.confirmDeleteItem(e, index)}"
                  data-args="${index}"
                  icon="cancel"
                ></paper-icon-button>
              </div>
            </div>
            <div class="item-content">
              <div class="row-h">
                <div class="col col-4">
                  <etools-dropdown
                    id="disaggregate_by_${index}"
                    label="Disaggregate By"
                    .options="${this.preDefinedDisaggregtions}"
                    .selected="${item.disaggregId}"
                    option-value="id"
                    option-label="name"
                    trigger-value-change-event
                    @etools-selected-item-changed="${(event: CustomEvent) =>
                      this._onDisaggregationSelected(event, index)}"
                    disable-on-focus-handling
                    fit-into="etools-dialog"
                  >
                  </etools-dropdown>
                </div>
                <div class="col col-8">
                  <paper-input
                    id="disaggregationGroups_${index}"
                    readonly
                    label="Disaggregation Groups"
                    placeholder="&#8212;"
                  ></paper-input>
                </div>
              </div>
            </div>
          </div>`
        )}
      </div>

      <div class="row-padding-v" ?hidden="${!this._isEmptyList(this.dataItems, this.dataItems.length)}">
        <p>There are no disaggregations added.</p>
      </div>

      <div class="row-padding-v">
        <paper-button
          class="secondary-btn"
          @click="${this._addNewDisaggregation}"
          ?hidden="${this._maxDisaggregations(this.dataItems.length)}"
          title="Add Disaggregation"
          >ADD DISAGGREGATION
        </paper-button>
      </div>
    `;
  }

  @property({type: Array})
  preDefinedDisaggregtions!: Disaggregation[];

  @property({type: Array})
  dataItems!: any[];

  @property({type: Object})
  dataSetModel!: AnyObject | null;

  @property({type: Boolean})
  editMode!: boolean;

  connectedCallback() {
    super.connectedCallback();
    this.dataSetModel = {disaggregId: null};
    this.editMode = true;
    this.preDefinedDisaggregtions = flaggedSortedDisaggregs(getStore().getState());
    this.addEventListener('delete-confirm', this._updateTabCounter as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('delete-confirm', this._updateTabCounter as any);
  }

  _isEmptyList(disaggregations: Disaggregation[], disaggregLength: number) {
    return !disaggregations || !disaggregLength;
  }

  _maxDisaggregations(disaggregLength: number) {
    return disaggregLength >= 3;
  }

  async confirmDeleteItem(event: CustomEvent, index: number) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: 'Are you sure you want to delete this item?',
        confirmBtnText: 'Delete'
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deleteDisaggregation(event, index);
    }
  }

  public _deleteDisaggreg(index: number) {
    if (!this.editMode) {
      return;
    }
    // const index = Number(this.elToDeleteIndex);
    if (index >= 0) {
      this.dataItems.splice(index, 1);
      // To mke sure all req. observers are triggered
      this.dataItems = cloneDeep(this.dataItems);

      fireEvent(this, 'delete-confirm', {index: index});
    }
  }

  deleteDisaggregation(event: CustomEvent, index: number) {
    // const endpoint = getEndpoint(interventionEndpoints.disaggregationDelete, {
    //   disaggregId: disaggregId
    // });
    // sendRequest({
    //   method: 'DELETE',
    //   endpoint: endpoint
    // })
    //   .then((_resp: any) => {
    //     this._deleteDisaggreg(index);
    //   })
    //   .catch((err: any) => {
    //     fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
    //   });
    this._deleteDisaggreg(index);
  }

  _addNewDisaggregation() {
    this._addElement();
    fireEvent(this, 'add-new-disaggreg', this.dataItems);
  }

  _addElement(addNull?: boolean) {
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
  _makeSureDataItemsAreValid(dataItems?: any) {
    const items = dataItems ? dataItems : this.dataItems;
    if (!Array.isArray(items)) {
      this.dataItems = [];
    }
  }

  _getItemModelObject(addNull: any) {
    if (addNull) {
      return null;
    }
    if (this.dataSetModel === null) {
      const newObj: AnyObject = {};
      if (this.dataItems.length > 0 && typeof this.dataItems[0] === 'object') {
        Object.keys(this.dataItems[0]).forEach((property) => {
          newObj[property] = ''; // (this.model[0][property]) ? this.model[0][property] :
        });
      }

      return newObj;
    } else {
      return JSON.parse(JSON.stringify(this.dataSetModel));
    }
  }

  _onDisaggregationSelected(event: CustomEvent, index: number) {
    const selectedDisagreg = event.detail.selectedItem;
    if (!selectedDisagreg) {
      return;
    }

    this.dataItems[index].disaggregId = selectedDisagreg.id;
    if (this.isAlreadySelected(selectedDisagreg.id, index, 'disaggregId')) {
      this.shadowRoot!.querySelector<EtoolsDropdownEl>('#disaggregate_by_' + index)!.selected = null;
      this._clearDisagregGroups(index);
      fireEvent(this, 'show-toast', {
        error: {response: 'Disaggregation already selected'}
      });
      this.dataItems[index].disaggregId = null;
    } else {
      this._displayDisaggregationGroups(selectedDisagreg, index);
    }
    this.requestUpdate();
  }

  /**
   * selValue - the just selected value or id
   * selIndex - the index of the selected data item
   * itemValueName - the name of property to compare selValue against
   */
  isAlreadySelected(selValue: any, selIndex: any, itemValueName: any) {
    const duplicateItems =
      this.dataItems &&
      this.dataItems.filter((item, index) => {
        return parseInt(item[itemValueName]) === parseInt(selValue) && parseInt(String(index)) !== parseInt(selIndex);
      });
    return duplicateItems && duplicateItems.length;
  }

  _displayDisaggregationGroups(selectedDisagreg: Disaggregation, index: number) {
    this._getDisagregGroupElem(index).value = selectedDisagreg.disaggregation_values.map((d) => d.value).join('; ');
  }

  _clearDisagregGroups(index: number) {
    this._getDisagregGroupElem(index).value = '';
  }

  _getDisagregGroupElem(index: number) {
    return this.shadowRoot!.querySelector('#disaggregationGroups_' + index) as PaperInputElement;
  }

  _updateTabCounter() {
    fireEvent(this, 'update-tab-counter', {count: this.dataItems.length});
  }
}
