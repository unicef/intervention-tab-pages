import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-data-table/etools-data-table';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import './add-amendment-dialog';
import {AddAmendmentDialog} from './add-amendment-dialog';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {AnyObject, LabelAndValue} from '../../common/models/globals.types';
import {prettyDate} from '../../utils/date-utils';
import {getFileNameFromURL, isJsonStrMatch} from '../../utils/utils';
import {selectAmendmentsPermissions} from './pd-amendments.selectors';
import {Permission} from '../../common/models/intervention.types';
import {PdAmendmentPermissions} from './pd-amendments.models';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';

/**
 * @customElement
 */
@customElement('pd-amendments')
export class PdAmendments extends connect(getStore())(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit];
  }

  render() {
    return html`<style>
        ${sharedStyles} :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
          --ecp-content-padding: 0;
          margin-bottom: 24px;
        }
        .attachment {
          color: var(--dark-icon-color);
          margin-right: 8px;
        }
        .file-label {
          width: calc(100% - 32px);
        }
        .other-description {
          display: block;
          width: 100%;
        }
        *[slot='row-data'] {
          margin-top: 12px;
          margin-bottom: 12px;
        }
      </style>

      <etools-content-panel panel-title="Amendments">
        <div slot="panel-btns">
          <paper-icon-button
            icon="add"
            title="Add Amendment"
            ?hidden="${!this.permissions.edit.amendments}"
            @tap="${() => this._showAddAmendmentDialog()}"
          >
          </paper-icon-button>
        </div>
        <div class="p-relative" id="amendments-wrapper">
          <etools-data-table-header id="listHeader" no-collapse no-title ?hidden="${!this.amendments.length}">
            <etools-data-table-column class="col-1">
              Ref #
            </etools-data-table-column>
            <etools-data-table-column class="col-2">
              Signed Date
            </etools-data-table-column>
            <etools-data-table-column class="col-3">
              Amendment Types
            </etools-data-table-column>
            <etools-data-table-column class="col-2">
              Signed Amendment
            </etools-data-table-column>
            <etools-data-table-column class="flex-c">
              Internal / PRC Reviews
            </etools-data-table-column>
            <etools-data-table-column class="flex-c">
              Other Info
            </etools-data-table-column>
          </etools-data-table-header>

          ${this.amendments.map(
            (item: AnyObject) => html`
              <etools-data-table-row no-collapse>
                <div slot="row-data" class="layout-horizontal">
                  <span class="col-data col-1">
                    ${item.amendment_number}
                  </span>
                  <span class="col-data col-2">
                    ${prettyDate(item.signed_date)}
                  </span>
                  <span class="col-data col-3">
                    ${this._getReadonlyAmendmentTypes(item.types)}
                  </span>
                  <span class="col-data col-2">
                    <iron-icon icon="attachment" class="attachment"></iron-icon>
                    <span class="break-word file-label">
                      <a href="${item.signed_amendment_attachment}" target="_blank" download>
                        ${getFileNameFromURL(item.signed_amendment_attachment)}
                      </a>
                    </span>
                  </span>
                  <span class="col-data flex-c">
                    <span ?hidden="${item.internal_prc_review}" class="placeholder-style">&#8212;</span>
                    <iron-icon icon="attachment" class="attachment" ?hidden="${!item.internal_prc_review}"></iron-icon>
                    <span class="break-word file-label">
                      <a href="${item.internal_prc_review}" target="_blank" download>
                        ${getFileNameFromURL(item.internal_prc_review)}
                      </a>
                    </span>
                  </span>
                  <div class="col-data flex-c break-word">
                    <span
                      ?hidden="${() => this._showOtherInput(item.types, item.types.length)}"
                      class="placeholder-style"
                    >
                      &#8212;
                    </span>
                    <div class="other-description" ?hidden="${this._showOtherInput(item.types, item.types.length)}">
                      ${item.other_description}
                    </div>
                  </div>
                </div>
              </etools-data-table-row>
            `
          )}
          <div class="row-h" ?hidden=${this.amendments.length}>
            <p>There are no amendments added.</p>
          </div>
        </div>
      </etools-content-panel> `;
  }

  @property({type: Array})
  amendments: AnyObject[] = [];

  @property({type: Array})
  filteredAmendmentTypes!: LabelAndValue[];

  @property({type: Array})
  amendmentTypes!: LabelAndValue[];

  @property({type: Object})
  addAmendmentDialog!: AddAmendmentDialog;

  @property({type: Object})
  permissions!: Permission<PdAmendmentPermissions>;

  @property({type: Object})
  intervention!: AnyObject;

  stateChanged(state: AnyObject) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'management')) {
      return;
    }

    const amendmentTypes = get(state, 'commonData.interventionAmendmentTypes');
    if (amendmentTypes && !isJsonStrMatch(this.amendmentTypes, amendmentTypes)) {
      this.amendmentTypes = [...state.commonData!.interventionAmendmentTypes];
    }
    const currentIntervention = get(state, 'interventions.current');
    if (currentIntervention && !isJsonStrMatch(this.intervention, currentIntervention)) {
      this.intervention = cloneDeep(currentIntervention);
      this.amendments = this.intervention.amendments;
    }
    this.setPermissions(state);
  }

  private setPermissions(state: any) {
    const permissions = selectAmendmentsPermissions(state);

    if (!isJsonStrMatch(this.permissions, permissions)) {
      this.permissions = permissions;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeAddAmendmentDialog();
  }

  _createAddAmendmentDialog() {
    if (!this.addAmendmentDialog) {
      this.addAmendmentDialog = document.createElement('add-amendment-dialog') as AddAmendmentDialog;
      this.addAmendmentDialog.setAttribute('id', 'addAmendmentDialog');
      this.addAmendmentDialog.toastEventSource = this;
      document.querySelector('body')!.appendChild(this.addAmendmentDialog);
    }
  }

  _removeAddAmendmentDialog() {
    if (this.addAmendmentDialog) {
      document.querySelector('body')!.removeChild(this.addAmendmentDialog);
    }
  }

  _getReadonlyAmendmentTypes(types: string[]) {
    if (!types || !types.length) {
      return null;
    }
    const amdTypes = this.amendmentTypes.filter((t: AnyObject) => {
      return types.indexOf(t.value) > -1;
    });
    if (amdTypes.length) {
      const amdTypesLabels = amdTypes.map((t: AnyObject) => {
        return t.label;
      });
      return amdTypesLabels.join(', ');
    }
    return null;
  }

  _showAddAmendmentDialog() {
    this._createAddAmendmentDialog();
    this.addAmendmentDialog.intervention = this.intervention;
    this.addAmendmentDialog.openDialog();
  }

  _showOtherInput(selectedAmdTypes: string[], _selectedAmdTypesLength: number) {
    if (!selectedAmdTypes || !selectedAmdTypes.length) {
      return false;
    }
    return selectedAmdTypes.indexOf('other') > -1;
  }
}
