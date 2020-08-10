import {customElement, html, LitElement, property} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import './grouped-locations-dialog';
import {GroupedLocationsDialog} from './grouped-locations-dialog';

import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {getStore} from '../../utils/redux-store-access';
import {connect} from 'pwa-helpers/connect-mixin';
import {LocationsPermissions} from './geographicalCoverage.models';
import {Permission} from '../../common/models/intervention.types';
import {selectLocationsPermissions} from './geographicalCoverage.selectors';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {validateRequiredFields} from '../../utils/validation-helper';
import {patchIntervention} from '../../common/actions';
import isEmpty from 'lodash-es/isEmpty';
import get from 'lodash-es/get';
import {isJsonStrMatch} from '../../utils/utils';

/**
 * @customElement
 */
@customElement('geographical-coverage')
export class GeographicalCoverage extends connect(getStore())(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    if (!this.data) {
      return html`<style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
      <style>
        ${sharedStyles} :host {
          display: block;
          margin-bottom: 24px;
        }

        .see-locations {
          padding-right: 0;
          color: var(--primary-color);
          min-width: 100px;
          flex-direction: row;
          padding-bottom: 12px;
        }

        .see-locations iron-icon {
          margin-right: 0;
          margin-bottom: 2px;
          --iron-icon-height: 18px;
          --iron-icon-width: 18px;
        }

        .see-locations[disabled] {
          background-color: transparent;
        }

        #locations {
          max-width: 100%;
        }
      </style>

      <etools-content-panel show-expand-btn panel-title="Geographical Coverage">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>

        <div slot="panel-btns">
          ${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}
        </div>

        <div class="flex-c layout-horizontal row-padding-v">
          <etools-dropdown-multi
            id="locations"
            label="Location(s)"
            placeholder="&#8212;"
            .options="${this.data}"
            .selectedValues="${this.originalData.flat_locations}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.flat_locations)}"
            ?required="${this.permissions.required.flat_locations}"
            option-label="name"
            option-value="id"
            error-message="Please select locations"
            disable-on-focus-handling
            trigger-value-change-event
            @etools-selected-items-changed="${({detail}: CustomEvent) =>
              this.selectedItemsChanged(detail, 'flat_locations')}"
          >
          </etools-dropdown-multi>
          <paper-button
            class="secondary-btn see-locations right-align"
            @tap="${this.openLocationsDialog}"
            ?disabled="${this._isEmpty(this.originalData.flat_locations)}"
            title="See all locations"
          >
            <iron-icon icon="add"></iron-icon>
            See all
          </paper-button>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  private locationsDialog!: GroupedLocationsDialog;

  @property({type: Array})
  data!: any[];

  @property({type: Boolean})
  showLoading = false;

  @property({type: Object})
  permissions!: Permission<LocationsPermissions>;

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: any) {
    if (!state.interventions.current) {
      return;
    }
    if (!isJsonStrMatch(this.data, state.commonData!.locations)) {
      this.data = [...state.commonData!.locations];
    }
    if (!isJsonStrMatch(get(this.originalData, 'flat_locations'), get(state, 'interventions.current.flat_locations'))) {
      this.originalData = {flat_locations: get(state, 'interventions.current.flat_locations')};
    }
    this.sePermissions(state);
  }

  private sePermissions(state: any) {
    const newPermissions = selectLocationsPermissions(state);
    if (!isJsonStrMatch(this.permissions, newPermissions)) {
      this.permissions = newPermissions;
      this.set_canEditAtLeastOneField(this.permissions.edit);
    }
  }

  private openLocationsDialog() {
    this.createDialog();
    this.locationsDialog.adminLevel = null;
    this.locationsDialog.interventionLocationIds = this.originalData.flat_locations;
    (this.locationsDialog as GroupedLocationsDialog).openDialog();
  }

  createDialog() {
    this.locationsDialog = document.createElement('grouped-locations-dialog') as GroupedLocationsDialog;
    this.locationsDialog.setAttribute('id', 'groupedLocDialog');
    this.locationsDialog.toastEventSource = this;
    document.querySelector('body')!.appendChild(this.locationsDialog);
  }

  _isEmpty(array: any[]) {
    return isEmpty(array);
  }

  validate() {
    return validateRequiredFields(this);
  }

  save() {
    if (!this.validate()) {
      return;
    }
    getStore()
      .dispatch(patchIntervention(this.data))
      .then(() => {
        this.editMode = false;
      });
  }
}
