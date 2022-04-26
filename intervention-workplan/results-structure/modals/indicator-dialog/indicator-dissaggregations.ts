import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';

import {PaperInputElement} from '@polymer/paper-input/paper-input.js';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {LitElement, html, property, customElement} from 'lit-element';
import {flaggedSortedDisaggregs} from '../../redux/selectors';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {AnyObject, Disaggregation} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';
import RepeatableDataSetsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/repeatable-data-sets-mixin';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {repeatableDataSetsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/repeatable-data-sets-styles';
import {callClickOnSpacePushListener} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import '@unicef-polymer/etools-info-tooltip/info-icon-tooltip';

/**
 * @customElement
 * @applies MixinRepeatableDataSets
 */
@customElement('indicator-dissaggregations')
export class IndicatorDisaggregations extends RepeatableDataSetsMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    return html`
      ${repeatableDataSetsStyles} ${sharedStyles}
      <style>
        [hidden] {
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
      <div ?hidden="${this._isEmptyList(this.data, this.data.length)}">
        ${this.data.map(
          (item: any, index: number) => html` <div class="row-h item-container no-h-margin">
            <div class="item-actions-container">
              <div class="actions">
                <paper-icon-button
                  class="action delete"
                  ?disabled="${this.readonly}"
                  @click="${(e: CustomEvent) => this._openDeleteConfirmation(e, index)}"
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
                    label=${translate('DISAGGREGATE_BY')}
                    .options="${this.preDefinedDisaggregtions}"
                    .selected="${item.disaggregId}"
                    option-value="id"
                    option-label="name"
                    trigger-value-change-event
                    ?readonly="${this.readonly}"
                    @etools-selected-item-changed="${(event: CustomEvent) =>
                      this._onDisaggregationSelected(event, index)}"
                    disable-on-focus-handling
                  >
                  </etools-dropdown>
                </div>
                <div class="col col-8">
                  <paper-input
                    id="disaggregationGroups_${index}"
                    readonly
                    tabindex="-1"
                    label=${translate('DISAGGREGATION_GROUPS')}
                    placeholder="&#8212;"
                  ></paper-input>
                </div>
              </div>
            </div>
          </div>`
        )}
      </div>

      <div class="row-padding-v" ?hidden="${!this._isEmptyList(this.data, this.data.length)}">
        <p>${translate('NO_DISAGGREGATIONS_ADDED')}</p>
      </div>

      <div class="row-padding-v" style="margin-bottom:80px;">
        <paper-button
          class="secondary-btn"
          @click="${this._addNewDisaggregation}"
          ?hidden="${this._maxDisaggregations(this.data.length) || this.readonly}"
          title=${translate('ADD_DISAGGREGATION')}
          >${translate('ADD_DISAGREG')}
        </paper-button>
        <info-icon-tooltip
          id="iit-disaggreg"
          .tooltipText="${translate('DISAGGREGATION_TOOLTIP')}"
          ?hidden="${this._maxDisaggregations(this.data.length) || this.readonly}"
        ></info-icon-tooltip>
      </div>
    `;
  }

  @property({type: Array})
  preDefinedDisaggregtions!: Disaggregation[];

  @property({type: Boolean})
  readonly!: boolean | undefined;

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

  _addNewDisaggregation() {
    this._addElement();
    fireEvent(this, 'add-new-disaggreg', this.data);
  }

  _onDisaggregationSelected(event: CustomEvent, index: number) {
    const selectedDisagreg = event.detail.selectedItem;
    if (!selectedDisagreg) {
      return;
    }

    this.data[index].disaggregId = selectedDisagreg.id;
    if (this.isAlreadySelected(selectedDisagreg.id, index, 'disaggregId')) {
      this.shadowRoot!.querySelector<EtoolsDropdownEl>('#disaggregate_by_' + index)!.selected = null;
      this._clearDisagregGroups(index);
      fireEvent(this, 'show-toast', {
        error: {response: getTranslation('DISAGREG_ALREADY_SELECTED')}
      });
      this.data[index].disaggregId = null;
    } else {
      this._displayDisaggregationGroups(selectedDisagreg, index);
    }
    this.requestUpdate();
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
    fireEvent(this, 'update-tab-counter', {count: this.data.length});
  }

  _mapSpaceToClick() {
    setTimeout(() => {
      this.shadowRoot!.querySelectorAll('etools-dropdown').forEach((el, index) => {
        const paperEl = el.shadowRoot!.querySelector('paper-input');
        if (paperEl) {
          callClickOnSpacePushListener(paperEl);
          if (index === 0) {
            paperEl.focus();
          }
        }
      }, 200);
    });
  }

  public _getItemModelObject(addNull: any) {
    if (addNull) {
      return null;
    }
    if (this.dataSetModel === null) {
      const newObj: AnyObject = {};
      if (this.data.length > 0 && typeof this.data[0] === 'object') {
        Object.keys(this.data[0]).forEach(function (property) {
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
    this.data = [...this.data, newObj];
    this._mapSpaceToClick();
  }

  /**
   * Check is dataItems is Array, if not init with empty Array
   */
  public _makeSureDataItemsAreValid(dataItems?: any) {
    const items = dataItems ? dataItems : this.data;
    if (!Array.isArray(items)) {
      this.data = [];
    }
  }
}
