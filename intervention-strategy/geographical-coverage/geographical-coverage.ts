import {customElement, html, LitElement, property} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import './grouped-locations-dialog';
import './sites-dialog';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {LocationsPermissions} from './geographicalCoverage.models';
import {selectLocationsPermissions} from './geographicalCoverage.selectors';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {patchIntervention} from '../../common/actions/interventions';
import {isJsonStrMatch} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {RootState} from '../../common/types/store.types';
import cloneDeep from 'lodash-es/cloneDeep';
import isEmpty from 'lodash-es/isEmpty';
import get from 'lodash-es/get';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject, AsyncAction, LocationObject, Permission, Site} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {TABS} from '../../common/constants';
import '@unicef-polymer/etools-info-tooltip/info-icon-tooltip';

/**
 * @customElement
 */
@customElement('geographical-coverage')
export class GeographicalCoverage extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    if (!this.data || !this.permissions) {
      return html` ${sharedStyles}
        <etools-loading source="geo" loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }

        .see-locations {
          padding-right: 0;
          color: var(--primary-color);
          min-width: 100px;
          display: flex;
          flex-direction: row;
          padding-bottom: 12px;
        }

        .locations-btn {
          margin: auto;
          width: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
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

        .f-left {
          float: left;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }

        info-icon-tooltip {
          --iit-margin: 8px 0 8px -15px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('GEOGRAPHICAL_COVERAGE')}
        comment-element="geographical-coverage"
      >
        <div slot="after-title">
          <info-icon-tooltip
            id="iit-geo"
            ?hidden="${!this.canEditAtLeastOneField}"
            .tooltipText="${translate('GEOGRAPHICAL_COVERAGE_INFO')}"
          ></info-icon-tooltip>
        </div>
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="flex-c layout-horizontal row-padding-v">
          <etools-dropdown-multi
            id="locations"
            label=${translate(translatesMap.flat_locations)}
            placeholder="&#8212;"
            .options="${this.allLocations}"
            .selectedValues="${this.data.flat_locations}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.flat_locations)}"
            ?required="${this.permissions.required.flat_locations}"
            option-label="name"
            option-value="id"
            error-message=${translate('LOCATIONS_ERR')}
            trigger-value-change-event
            @etools-selected-items-changed="${({detail}: CustomEvent) =>
              this.selectedItemsChanged(detail, 'flat_locations')}"
          >
          </etools-dropdown-multi>
          <div class="locations-btn">
            <paper-button
              class="secondary-btn see-locations right-align"
              @click="${this.openLocationsDialog}"
              ?hidden="${this._isEmpty(this.data.flat_locations)}"
              title=${translate('SEE_ALL_LOCATIONS')}
            >
              <iron-icon icon="add"></iron-icon>
              ${translate('SEE_ALL')}
            </paper-button>
          </div>
        </div>
        <div class="flex-c layout-horizontal row-padding-v">
          <paper-textarea
            label=${translate(translatesMap.sites)}
            always-float-label
            class="w100"
            placeholder="&#8212;"
            readonly
            max-rows="4"
            .value="${this.getSelectedSitesText(this.data.sites)}"
          ></paper-textarea>
          <div class="locations-btn"></div>
        </div>
        <div class="flex-c layout-horizontal row-padding-v">
          <paper-button
            class="secondary-btn see-locations f-left"
            @click="${this.openSitesDialog}"
            ?hidden="${!this.editMode}"
            title=${translate('SELECT_LOCATION_BY_SITE_FROM_MAP')}
          >
            <iron-icon icon="add"></iron-icon>
            ${translate('SELECT_LOCATION_BY_SITE_FROM_MAP')}
          </paper-button>
        </div>
        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  allLocations!: LocationObject[];

  @property({type: Array})
  allSites!: Site[];

  @property({type: Object})
  currentCountry!: AnyObject;

  @property({type: Array})
  adminLevels!: AnyObject[];

  @property({type: Object})
  data!: {flat_locations: string[]; sites: Site[]};

  @property({type: Object})
  permissions!: Permission<LocationsPermissions>;

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Strategy)) {
      return;
    }
    if (!state.interventions.current) {
      return;
    }
    if (!isJsonStrMatch(this.allLocations, state.commonData!.locations)) {
      this.allLocations = [...state.commonData!.locations];
    }
    if (!isJsonStrMatch(this.allSites, state.commonData!.sites)) {
      this.allSites = [...state.commonData!.sites];
    }
    if (!isJsonStrMatch(this.adminLevels, state.commonData!.locationTypes)) {
      this.adminLevels = [...state.commonData!.locationTypes];
    }
    this.data = {
      flat_locations: get(state, 'interventions.current.flat_locations'),
      sites: get(state, 'interventions.current.sites') || []
    };
    this.currentCountry = get(state, 'user.data.country');
    this.originalData = cloneDeep(this.data);
    this.setPermissions(state);
    super.stateChanged(state);
  }

  private setPermissions(state: any) {
    this.permissions = selectLocationsPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
  }

  private openLocationsDialog() {
    openDialog({
      dialog: 'grouped-locations-dialog',
      dialogData: {
        adminLevel: null,
        allLocations: this.allLocations,
        adminLevels: this.adminLevels,
        interventionLocationIds: this.data.flat_locations
      }
    });
  }

  private openSitesDialog() {
    openDialog({
      dialog: 'sites-dialog',
      dialogData: {
        workspaceCoordinates: [this.currentCountry.longitude, this.currentCountry.latitude],
        sites: this.allSites,
        selectedSites: this.data.sites
      }
    }).then(({confirmed, response}) => {
      if (!confirmed) {
        return;
      }
      this.data.sites = response;
      this.data = {...this.data};
    });
  }

  getSelectedSitesText(sites: Site[]) {
    return (sites || []).map((x) => x.name).join('  |  ');
  }

  _isEmpty(array: any[]) {
    return isEmpty(array);
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }

    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.getDataForSave()))
      .then(() => {
        this.editMode = false;
      });
  }

  getDataForSave() {
    return {flat_locations: this.data.flat_locations, sites: (this.data.sites || []).map((x: Site) => x.id)};
  }
}
