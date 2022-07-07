import {customElement, html, LitElement, property} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import './grouped-locations-dialog';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {LocationsPermissions} from './geographicalCoverage.models';
import {selectLocationsPermissions} from './geographicalCoverage.selectors';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {patchIntervention} from '../../common/actions/interventions';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {RootState} from '../../common/types/store.types';
import cloneDeep from 'lodash-es/cloneDeep';
import isEmpty from 'lodash-es/isEmpty';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject, AsyncAction, Permission} from '@unicef-polymer/etools-types';
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
          white-space: nowrap;
          padding: 29px 0 0 50px;
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
          max-width: fit-content;
          min-width: 300px;
          --paper-input-container-label-floating_-_color: transparent;
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

        .dropdown-row {
          margin-top: -38px;
        }

        #iit-geo {
          --iit-margin: 8px 0 8px -15px;
        }

        .iit {
          --iit-icon-size: 18px;
          --iit-margin: 0 0 4px 4px;
        }

        etools-dropdown-multi::part(esmm-dropdownmenu) {
          left: 24px !important;
        }
        .row-padding-v {
          position: relative;
        }
        .location-icon {
          z-index: 999;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('GEOGRAPHICAL_COVERAGE')}
        comment-element="geographical-coverage"
        comment-description="Geographical Coverage"
      >
        <div slot="after-title">
          <info-icon-tooltip
            id="iit-geo"
            ?hidden="${!this.canEditAtLeastOneField}"
            .tooltipText="${translate('GEOGRAPHICAL_COVERAGE_INFO')}"
          ></info-icon-tooltip>
        </div>
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="flex-c layout-horizontal row-padding-v location-icon">
          <label class="paper-label"> ${translate(translatesMap.flat_locations)}</label>
          <info-icon-tooltip
            id="iit-locations"
            class="iit"
            position="right"
            ?hidden="${this.isReadonly(this.editMode, this.permissions.edit.flat_locations)}"
            .tooltipText="${translate('GEOGRAPHICAL_LOCATIONS_INFO')}"
          ></info-icon-tooltip>
        </div>
        <div>
          <paper-textarea
            id="title"
            no-label-float
            placeholder="—"
            .value="${this.data.location_names?.join(',')}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'flat_locations')}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit?.flat_locations)}"
            tabindex="${this.isReadonly(this.editMode, this.permissions.edit?.flat_locations) ? -1 : 0}"
          >
          </paper-textarea>
        </div>
        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  currentCountry!: AnyObject;

  @property({type: Object})
  data!: {flat_locations: string[]; location_names: string[]};

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
    this.data = {
      flat_locations: get(state, 'interventions.current.flat_locations'),
      location_names: get(state, 'interventions.current.location_names')
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
    return {flat_locations: this.data.flat_locations};
  }
}
