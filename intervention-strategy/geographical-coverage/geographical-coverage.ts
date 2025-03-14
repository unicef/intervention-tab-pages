import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import './grouped-locations-dialog';
import '../../common/components/sites-widget/sites-dialog';

import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {LocationsPermissions} from './geographicalCoverage.models';
import {selectLocationsPermissions} from './geographicalCoverage.selectors';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {patchIntervention} from '../../common/actions/interventions';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {RootState} from '../../common/types/store.types';
import cloneDeep from 'lodash-es/cloneDeep';
import isEmpty from 'lodash-es/isEmpty';
import get from 'lodash-es/get';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject, AsyncAction, LocationObject, Permission, Site} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {TABS} from '../../common/constants';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/info-icon-tooltip';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';

/**
 * @customElement
 */
@customElement('geographical-coverage')
export class GeographicalCoverage extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    if (!this.data || !this.permissions) {
      return html` ${sharedStyles}
        <etools-loading source="geo" active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }

        .locations-btn {
          white-space: nowrap;
          padding-top: 24px;
          padding-inline-start: 50px;
        }

        #locations {
          max-width: fit-content;
          min-width: 300px;
        }

        #locations::part(esmm-label) {
          opacity: 0;
        }

        .f-left {
          float: left;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }

        .mt-50 {
          margin-top: 50px;
        }

        .location-row {
          display: flex;
          flex-direction: column;
        }
        .dropdown-row {
          display: flex;
        }

        #iit-geo {
          --iit-margin: 0 0 0 4px;
          --iit-icon-size: 22px;
        }

        .iit {
          --iit-icon-size: 18px;
          --iit-margin: 0 0 4px 4px;
        }

        etools-dropdown-multi::part(esmm-dropdownmenu) {
          left: 0px !important;
        }
        .location-icon {
          z-index: 90;
          margin-bottom: -24px;
          padding-bottom: 0 !important;
        }
        .prevent-see-hierarchy-link-overlap {
          height: 10px;
        }
        etools-button[variant='text'] {
          --sl-input-height-medium: 20px !important;
        }
        @media (max-width: 768px) {
          .locations-btn {
            width: 100%;
            padding-inline-start: 0px;
            margin-left: -14px;
          }
          .dropdown-row {
            flex-wrap: wrap;
          }
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

        <div class="prevent-see-hierarchy-link-overlap"></div>
        <div class="row">
          <div class="col-12 location-row">
            <div class="location-icon">
              <label class="label"> ${translate(translatesMap.flat_locations)}</label>
              <info-icon-tooltip
                id="iit-locations"
                class="iit"
                position="right"
                ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit.flat_locations)}"
                .tooltipText="${translate('GEOGRAPHICAL_LOCATIONS_INFO')}"
              ></info-icon-tooltip>
            </div>
          </div>
          <div class="col-12 dropdown-row">
            <etools-dropdown-multi
              id="locations"
              placeholder="&#8212;"
              .options="${this.allLocations}"
              .selectedValues="${cloneDeep(this.data.flat_locations)}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.flat_locations)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.flat_locations) ? -1 : undefined}"
              ?required="${this.permissions?.required.flat_locations}"
              option-label="name"
              option-value="id"
              error-message=${translate('LOCATIONS_ERR')}
              trigger-value-change-event
              horizontal-align
              @etools-selected-items-changed="${({detail}: CustomEvent) =>
                this.selectedItemsChanged(detail, 'flat_locations')}"
            >
            </etools-dropdown-multi>
            <div class="locations-btn">
              <etools-button
                variant="text"
                @click="${this.openLocationsDialog}"
                ?hidden="${this._isEmpty(this.data.flat_locations)}"
                title=${translate('SEE_ALL_LOCATIONS')}
              >
                ${translate('SEE_HIERARCHY')}
              </etools-button>
            </div>
          </div>
        </div>
        <div class="row mt-50">
          <div class="col-12">
            <label class="label">${translate(translatesMap.sites)}</label>
            <info-icon-tooltip
              id="iit-sites"
              class="iit"
              slot="after-label"
              position="right"
              ?hidden="${!this.editMode}"
              .tooltipText="${translate('GEOGRAPHICAL_SITES_INFO')}"
            ></info-icon-tooltip>
          </div>
          <div class="col-12">
            <etools-textarea
              no-label-float
              class="w100"
              placeholder="&#8212;"
              readonly
              tabindex="-1"
              max-rows="4"
              .value="${this.getSelectedSitesText(this.data.sites)}"
            >
            </etools-textarea>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <etools-button
              variant="text"
              class="no-pad no-marg"
              @click="${this.openSitesDialog}"
              ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit.sites)}"
              title=${translate('SELECT_SITE_FROM_MAP')}
            >
              <etools-icon name="add"></etools-icon>
              ${translate('SELECT_SITE_FROM_MAP')}
            </etools-button>
          </div>
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
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Strategy)) {
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

    if (!isJsonStrMatch(this.originalData, this.selectCurrentLocationSites(state))) {
      this.data = this.selectCurrentLocationSites(state);
      this.originalData = cloneDeep(this.data);
    }

    this.currentCountry = get(state, 'user.data.country') as any;

    this.setPermissions(state);
    super.stateChanged(state);
  }

  selectCurrentLocationSites(state: RootState) {
    return {
      flat_locations: get(state, 'interventions.current.flat_locations') as unknown as string[],
      sites: get(state, 'interventions.current.sites') || []
    };
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
