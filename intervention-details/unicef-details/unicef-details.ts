import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-input/paper-input';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {selectPdUnicefDetails, selectPdUnicefDetailsPermissions} from './pdUnicefDetails.selectors';
import {PdUnicefDetailsPermissions} from './pdUnicefDetails.models';
import {Permission} from '../../common/models/intervention.types';
import {validateRequiredFields} from '../../utils/validation-helper';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {patchIntervention} from '../../common/actions';
import {AnyObject} from '../../common/models/globals.types';
import {isJsonStrMatch} from '../../utils/utils';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
// import {handleItemsNoLongerAssignedToCurrentCountry} from '../../utils/common-methods';

/**
 * @customElement
 */
@customElement('unicef-details')
export class UnicefDetailsElement extends connect(getStore())(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    // language=HTML
    if (!this.data) {
      return html`<style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      <style>
      ${sharedStyles}
        :host {
          display: block;
          margin-bottom: 24px;
        }
      </style>

      <etools-content-panel show-expand-btn panel-title="Unicef Details">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>

        <div slot="panel-btns">
          <paper-icon-button
            ?hidden="${this.hideEditIcon(this.editMode, this.canEditAtLeastOneField)}"
            @tap="${this.allowEdit}"
            icon="create">
          </paper-icon-button>
        </div>

        <div class="row-padding-v">
          <div class="col col-4">
            <paper-input
              label="Document Type"
              .value="${this.data.document_type}"
              class="row-padding-v"
              readonly>
            </paper-input>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-4">
            <etools-dropdown-multi
              id="officeInput"
              label="Unicef Office"
              class="row-padding-v"
              .options="${this.office_list}"
              option-label="name"
              option-value="id"
              .selectedValues="${this.data.offices}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.unicef_office)}"
              ?required="${this.permissions.required.unicef_office}"
              @etools-selected-items-changed="${({detail}: CustomEvent) =>
                this.selectedItemsChanged(detail, 'offices')}"
              trigger-value-change-event>
            </etools-dropdown-multi>
          </div>
          <div class="col col-4">
            <etools-dropdown-multi
              id="sectionInput"
              label="Unicef Sections"
              class="row-padding-v"
              .options="${this.section_list}"
              option-label="name"
              option-value="id"
              .selectedValues="${this.data.sections}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.sections)}"
              ?required="${this.permissions.required.sections}"
              @etools-selected-items-changed="${({detail}: CustomEvent) =>
                this.selectedItemsChanged(detail, 'sections')}"
              trigger-value-change-event>
            </etools-dropdown-multi>
          </div>
          <div class="col col-4">
            <etools-dropdown-multi
              label="Clusters"
              class="row-padding-v"
              .options="${this.cluster_list}"
              option-label="name"
              option-value="id"
              .selectedValues="${this.data.cluster_names}"
              readonly>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-4">
            <etools-dropdown-multi
              id="focalPointInput"
              label="Unicef Focal Points"
              class="row-padding-v"
              .options="${this.users_list}"
              option-label="name"
              option-value="id"
              .selectedValues="${this.data.unicef_focal_points}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.focal_points)}"
              ?required="${this.permissions.required.focal_points}"
              @etools-selected-items-changed="${({detail}: CustomEvent) =>
                this.selectedItemsChanged(detail, 'unicef_focal_points')}"
              trigger-value-change-event>
            </etools-dropdown-multi>
          </div>
          <div class="col col-4">
            <etools-dropdown
              id="budgetOwnerInput"
              label="Unicef Budget Owner"
              .options="${this.budget_owner_list}"
              class="row-padding-v"
              option-label="name"
              option-value="id"
              .selected="${this.data.budget_owner}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.budget_owner)}"
              ?required="${this.permissions.required.budget_owner}"
              @etools-selected-item-changed="${({detail}: CustomEvent) =>
                this.selectedItemChanged(detail, 'budget_owner')}"
              trigger-value-change-event>
            </etools-dropdown>
          </div>
        </div>

        <div class="layout-horizontal right-align row-padding-v"
          ?hidden="${this.hideActionButtons(this.editMode, this.canEditAtLeastOneField)}">
          <paper-button class="default" @tap="${this.cancel}">
            Cancel
          </paper-button>
          <paper-button class="primary" @tap="${this.savePdDetails}">
            Save
          </paper-button>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  permissions!: Permission<PdUnicefDetailsPermissions>;

  @property({type: Boolean})
  isUnicefUser = false;

  @property({type: Boolean})
  showLoading = false;

  @property({type: Array})
  users_list!: AnyObject[];

  @property({type: Array})
  budget_owner_list!: AnyObject[];

  @property({type: Array})
  office_list!: AnyObject[];

  @property({type: Array})
  section_list!: AnyObject[];

  @property({type: Array})
  cluster_list!: AnyObject[];

  stateChanged(state: any) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'details')) {
      return;
    }

    if (state.user && state.user.data) {
      this.isUnicefUser = state.user.data.is_unicef_user;
    }
    if (state.interventions.current) {
      const pdUnicefDetails = selectPdUnicefDetails(state);
      if (!isJsonStrMatch(this.data, pdUnicefDetails)) {
        this.data = cloneDeep(pdUnicefDetails);
        this.originalData = cloneDeep(pdUnicefDetails);
      }
    }
    this.setPermissions(state);
    this.populateDropdownOptions(state);
  }

  private setPermissions(state: any) {
    const permissions = selectPdUnicefDetailsPermissions(state);
    if (!isJsonStrMatch(this.permissions, permissions)) {
      this.permissions = permissions;
      this.set_canEditAtLeastOneField(this.permissions.edit);
    }
  }

  populateDropdownOptions(state: any) {
    if (!this.isUnicefUser) {
      if (this.data) {
        // if user is not Unicef user, this is opened in read-only mode and we just display already saved
        this.users_list = [...this.data.unicef_focal_points];
        this.section_list = [...this.data.sections];
        this.cluster_list = [...this.data.cluster_names];
        this.office_list = [...this.data.offices];
        this.budget_owner_list = [...this.data.budget_owner];
      }
    } else {
      if (get(state, 'commonData.unicefUsersData.length')) {
        this.users_list = [...state.commonData!.unicefUsersData];
        this.budget_owner_list = this.users_list;
      }
      if (get(state, 'commonData.sections.length')) {
        this.section_list = [...state.commonData!.sections];
      }
      if (get(state, 'commonData.clusters.length')) {
        this.cluster_list = [...state.commonData!.clusters];
      }
      if (get(state, 'commonData.offices.length')) {
        this.office_list = [...state.commonData!.offices];
      }
      // TO DO
      // check if already saved records exists on loaded data, if not they will be added
      // (they might be missing if changed country)
      // handleItemsNoLongerAssignedToCurrentCountry(
      //   this.focal_point_list,
      //   this.pdUnicefDetails.details.unicef_focal_points
      // );
      // this.focal_point_list = [...this.focal_point_list];
    }
  }

  validate() {
    return validateRequiredFields(this);
  }

  savePdDetails() {
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
