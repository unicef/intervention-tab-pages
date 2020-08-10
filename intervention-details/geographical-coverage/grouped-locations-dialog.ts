import {LitElement, html, property, customElement, query} from 'lit-element';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import {getStore} from '../../utils/redux-store-access';
import {connect} from 'pwa-helpers/connect-mixin';
import get from 'lodash-es/get';
import {LocationObject} from '../../common/models/globals.types';
import {isJsonStrMatch} from '../../utils/utils';

class GroupedLocations {
  adminLevelLocation: LocationObject | null = null;
  subordinateLocations: LocationObject[] = [];
}

/**
 * @customElement
 */
@customElement('grouped-locations-dialog')
export class GroupedLocationsDialog extends connect(getStore())(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    // language=HTML
    return html`
      <style>
        [hidden] {
          display: none !important;
        }

        etools-dialog {
          --etools-dialog-scrollable: {
            min-height: 300px;
            font-size: 16px;
          }
        }

        .adminLevelLoc {
          color: var(--primary-color);
          font-weight: bold;
        }

        .left-padding {
          padding-left: 16px;
        }

        .top-padding {
          padding-top: 16px;
        }

        .child-bottom-padding {
          padding-bottom: 8px;
        }

        .parent-padding {
          padding-bottom: 8px;
          padding-top: 8px;
        }

        .bordered-div {
          border: solid 1px var(--error-box-border-color);
          background-color: var(--error-box-bg-color);
          padding: 10px;
          margin: 16px 0;
        }

        div.child-bottom-padding:last-of-type {
          padding-bottom: 0;
        }
      </style>

      <etools-dialog
        id="groupedLocDialog"
        size="md"
        dialog-title="Locations PD/SSFA Covers"
        hide-confirm-btn
        ?opened="${this.dialogOpened}"
        @close="${() => this.closeDialog()}"
      >
        <etools-dropdown
          id="adminLevelsDropdw"
          label="Group Locations By"
          .selected="${this.adminLevel}"
          placeholder="&#8212;"
          .options="${this.adminLevels}"
          option-label="name"
          option-value="name"
          disable-on-focus-handling
          trigger-value-change-event
          @etools-selected-item-changed="${this.adminLevelChanged}"
        >
        </etools-dropdown>

        ${this._renderMessage(this.message)} ${this._renderGrouping(this.groupedLocations, this.interventionLocations)}
      </etools-dialog>
    `;
  }

  private _interventionLocIds: string[] = [];

  _adminLevels!: {id: number; name: string; admin_level: any}[];

  set adminLevels(locationTypes) {
    this._adminLevels = this._removeCountry(locationTypes);
  }

  @property({type: Array})
  get adminLevels() {
    return this._adminLevels;
  }

  @property({type: String})
  adminLevel!: string | null;

  @property({type: Array})
  allLocations!: LocationObject[];

  @property({type: Array})
  interventionLocations: LocationObject[] = [];

  @property({type: Array})
  get interventionLocationIds() {
    return this._interventionLocIds;
  }

  set interventionLocationIds(locationIds: string[]) {
    this.interventionLocationIdsChanged(locationIds);
  }

  @property({type: Array})
  groupedLocations: GroupedLocations[] = [];

  @property({type: String})
  message = '';

  @property({type: Boolean, reflect: true})
  dialogOpened = false;

  @property({type: Object})
  toastEventSource!: LitElement;

  @query('#groupedLocDialog')
  groupedLocDialog!: EtoolsDialog;

  stateChanged(state: any) {
    if (!isJsonStrMatch(this.allLocations, state.commonData!.locations)) {
      this.allLocations = [...state.commonData!.locations];
    }
    if (!isJsonStrMatch(this.adminLevels, state.commonData!.locationTypes)) {
      this.adminLevels = [...state.commonData!.locationTypes];
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _renderGrouping(groupedLocations: GroupedLocations[], interventionLocations: LocationObject[]) {
    if (!this.adminLevel) {
      return html`<div class="row-padding-v">
        ${interventionLocations.map((item: LocationObject) => html`<div class="top-padding">- ${item.name}</div>`)}
      </div>`;
    }
    return html`
      <div class="row-padding-v">
        ${groupedLocations.map(
          (item) => html`
            <div class="parent-padding">
              <div class="adminLevelLoc">${item.adminLevelLocation!.name}</div>
              <div class="left-padding">
                ${item.subordinateLocations.map(
                  (sub) => html`
                    <div class="child-bottom-padding">
                      - ${sub.name}
                    </div>
                  `
                )}
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  _renderMessage(message: string) {
    if (message !== '') {
      return html`
        <div class="bordered-div">
          ${message}
        </div>
      `;
    } else {
      return html``;
    }
  }

  public openDialog() {
    this.dialogOpened = true;
  }

  _removeCountry(locationTypes: any) {
    if (!locationTypes || !locationTypes.length) {
      return [];
    }
    const index = locationTypes.findIndex(function (al: any) {
      return al.name === 'Country';
    });
    if (index > -1) {
      locationTypes.splice(index, 1);
      // this.adminLevels = [];
      return JSON.parse(JSON.stringify(locationTypes));
    }
  }

  interventionLocationIdsChanged(locationIds: string[]) {
    if (!locationIds || !locationIds.length || !this.allLocations) {
      this.interventionLocations = [];
      return;
    }
    this._setInterventionLocationsDetails(locationIds);
    this._interventionLocIds = locationIds;
  }

  _setInterventionLocationsDetails(locationIds: any[]) {
    locationIds = locationIds.map(function (loc) {
      return parseInt(loc);
    });
    const interventionLocations = this.allLocations.filter(function (loc: any) {
      return locationIds.indexOf(parseInt(loc.id)) > -1;
    });

    this.interventionLocations = [];
    this.interventionLocations = interventionLocations;
  }

  adminLevelChanged(event: CustomEvent) {
    const selectedAdminLevelName = get(event.detail, 'selectedItem.name');
    if (!selectedAdminLevelName) {
      this.groupedLocations = [];
      return;
    }
    this.adminLevel = selectedAdminLevelName;

    this.message = '';
    const groupedLocations: GroupedLocations[] = [];
    const locationsUnableToGroup = [];
    let i;
    // Build grouped locations structure
    for (i = 0; i < this.interventionLocations.length; i++) {
      const grouping = new GroupedLocations();

      if (this.interventionLocations[i].gateway.name === selectedAdminLevelName) {
        // gateway.name is location_type
        grouping.adminLevelLocation = this.interventionLocations[i];
        groupedLocations.push(grouping);
        continue;
      }

      // Find admin level parent location
      const adminLevelLocation = this._findAdminLevelParent(this.interventionLocations[i], selectedAdminLevelName);
      if (!adminLevelLocation) {
        locationsUnableToGroup.push(this.interventionLocations[i].name);
        continue;
      }
      // Check if admin level parent Location is already a parent to another intervention location
      const existingGroup = this._findInGroupedLocations(groupedLocations, adminLevelLocation);
      if (!existingGroup) {
        groupedLocations.push({
          adminLevelLocation: adminLevelLocation,
          subordinateLocations: [this.interventionLocations[i]]
        });
      } else {
        existingGroup.subordinateLocations.push(this.interventionLocations[i]);
      }
    }

    if (locationsUnableToGroup && locationsUnableToGroup.length) {
      this.message = 'Locations unable to group: ' + locationsUnableToGroup.join(', ');
    }

    this.groupedLocations = groupedLocations;

    (this.groupedLocDialog as EtoolsDialog).notifyResize();
  }

  _findInGroupedLocations(groupedLocations: GroupedLocations[], adminLevelLocation: any) {
    if (!groupedLocations || !groupedLocations.length) {
      return null;
    }
    const existingGroup = groupedLocations.find(function (g) {
      return parseInt((g.adminLevelLocation!.id as unknown) as string) === parseInt(adminLevelLocation.id);
    });

    if (!existingGroup) {
      return null;
    }
    return existingGroup;
  }

  _findAdminLevelParent(location: LocationObject, adminLevel: string): LocationObject | null {
    if (!location.parent) {
      return null;
    }
    const parentLoc = this.allLocations.find(function (loc: any) {
      return parseInt(loc.id) === parseInt(location.parent as string);
    });
    if (!parentLoc) {
      return null;
    }
    if (parentLoc.gateway.name === adminLevel) {
      return parentLoc;
    }
    return this._findAdminLevelParent(parentLoc, adminLevel);
  }

  public closeDialog() {
    this.dialogOpened = false;
  }
}
