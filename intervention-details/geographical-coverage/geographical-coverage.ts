import {customElement, html, LitElement, property} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import './grouped-locations-dialog';

import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {getStore} from '../../utils/redux-store-access';
import {LocationsPermissions} from './geographicalCoverage.models';
import {selectLocationsPermissions} from './geographicalCoverage.selectors';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {patchIntervention} from '../../common/actions/interventions';
import {isJsonStrMatch} from '../../utils/utils';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import {RootState} from '../../common/types/store.types';
import cloneDeep from 'lodash-es/cloneDeep';
import isEmpty from 'lodash-es/isEmpty';
import get from 'lodash-es/get';
import {openDialog} from '../../utils/dialog';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject, AsyncAction, LocationObject, Permission} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

/**
 * @customElement
 */
@customElement('geographical-coverage')
export class GeographicalCoverage extends CommentsMixin(ComponentBaseMixin(LitElement)) {
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
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('INTERVENTION_DETAILS.GEOGRAPHICAL_COVERAGE')}
        comment-element="geographical-coverage"
        comment-description="Geographical Coverage"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="flex-c layout-horizontal row-padding-v">
          <etools-dropdown-multi
            id="locations"
            label=${translate('INTERVENTION_DETAILS.LOCATIONS')}
            placeholder="&#8212;"
            .options="${this.allLocations}"
            .selectedValues="${this.data.flat_locations}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.flat_locations)}"
            ?required="${this.permissions.required.flat_locations}"
            option-label="name"
            option-value="id"
            error-message=${translate('INTERVENTION_DETAILS.LOCATIONS_ERR')}
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
              title=${translate('INTERVENTION_DETAILS.SEE_ALL_LOCATIONS')}
            >
              <iron-icon icon="add"></iron-icon>
              ${translate('INTERVENTION_DETAILS.SEE_ALL')}
            </paper-button>
          </div>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  allLocations!: LocationObject[];

  @property({type: Array})
  adminLevels!: AnyObject[];

  @property({type: Object})
  data!: {flat_locations: string[]};

  @property({type: Object})
  permissions!: Permission<LocationsPermissions>;

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'details')) {
      return;
    }
    if (!state.interventions.current) {
      return;
    }
    if (!isJsonStrMatch(this.allLocations, state.commonData!.locations)) {
      this.allLocations = [...state.commonData!.locations];
    }
    if (!isJsonStrMatch(this.adminLevels, state.commonData!.locationTypes)) {
      this.adminLevels = [...state.commonData!.locationTypes];
    }
    this.data = {flat_locations: get(state, 'interventions.current.flat_locations')};
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

  _isEmpty(array: any[]) {
    return isEmpty(array);
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }

    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.data))
      .then(() => {
        this.editMode = false;
      });
  }
}
