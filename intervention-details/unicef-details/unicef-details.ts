import {LitElement, html, property, customElement, TemplateResult} from 'lit-element';
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
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {patchIntervention} from '../../common/actions';
import {AnyObject, RootState} from '../../common/models/globals.types';
import {isJsonStrMatch, areEqual} from '../../utils/utils';
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

        <div slot="panel-btns">
          ${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}
        </div>

        <div class="layout-horizontal">
          <div class="col col-4">
            <span>
              <label class="paper-label">Document Type</label>
            </span>
          </div>
        </div>
        <div class="layout-horizontal">
          <label class="input-label" ?empty="${!this.data.document_type}">
            ${this.getDocumentLongName(this.data.document_type)}
           </label>
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-4">
            <etools-dropdown-multi
              id="officeInput"
              label="Unicef Offices"
              class="row-padding-v"
              .options="${this.office_list}"
              option-label="name"
              option-value="id"
              .selectedValues="${this.data.offices}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.offices)}"
              ?required="${this.permissions.required.offices}"
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
              ?hidden="${this.isReadonly(this.editMode, this.permissions.edit.unicef_focal_points)}"
              ?required="${this.permissions.required.unicef_focal_points}"
              @etools-selected-items-changed="${({detail}: CustomEvent) =>
                this.selectedItemsChanged(detail, 'unicef_focal_points')}"
              trigger-value-change-event>
            </etools-dropdown-multi>
            <div ?hidden="${!this.isReadonly(this.editMode, this.permissions.edit.unicef_focal_points)}">
              <label for="focalPointInput" class="paper-label">Unicef Focal Points</label>
              <div id="focalPointDetails">
                ${this.renderReadonlyFocalPoints(
                  this.users_list,
                  this.originalData?.unicef_focal_points ? this.originalData?.unicef_focal_points! : []
                )}
              </div>
            </div>
          </div>
          <div class="col col-8">
            <etools-dropdown
              id="budgetOwnerInput"
              label="Unicef Budget Owner"
              .options="${this.users_list}"
              class="row-padding-v"
              option-label="name"
              option-value="id"
              .selected="${this.data.budget_owner}"
              ?hidden="${this.isReadonly(this.editMode, this.permissions.edit.budget_owner)}"
              ?required="${this.permissions.required.budget_owner}"
              @etools-selected-item-changed="${({detail}: CustomEvent) =>
                this.selectedItemChanged(detail, 'budget_owner')}"
              trigger-value-change-event>
            </etools-dropdown>

            <div ?hidden="${!this.isReadonly(this.editMode, this.permissions.edit.budget_owner)}">
              <label for="budgetOwnerInput" class="paper-label">Unicef Budget Owner</label>
              <div id="budgetOwnerDetails">
                ${this.renderReadonlyBudgetOwner(
                  this.users_list,
                  this.originalData?.budget_owner ? [this.originalData?.budget_owner!] : []
                )}
              </div>
            </div>
          </div>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  permissions!: Permission<PdUnicefDetailsPermissions>;

  @property({type: Boolean})
  isUnicefUser = false;

  @property({type: Array})
  users_list!: AnyObject[];

  @property({type: Array})
  office_list!: AnyObject[];

  @property({type: Array})
  section_list!: AnyObject[];

  @property({type: Array})
  cluster_list!: AnyObject[];

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'details')) {
      return;
    }

    if (state.user && state.user.data) {
      this.isUnicefUser = state.user.data.is_unicef_user;
    }
    if (state.interventions.current) {
      this.data = cloneDeep(selectPdUnicefDetails(state));
      this.originalData = cloneDeep(this.data);
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
      }
    } else {
      if (get(state, 'commonData.unicefUsersData.length')) {
        this.users_list = [...state.commonData!.unicefUsersData];
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

  /**
   * Optimization to avoid multiple calls to filter through the long users array
   */
  previousBudgetOwnerIds: string[] = [];
  previousBudgeOwnerDisplay: TemplateResult | TemplateResult[] = html`—`;
  renderReadonlyBudgetOwner(users: AnyObject[], selectedIds: string[]) {
    if (users == undefined) {
      return html`—`;
    }
    if (areEqual(this.previousBudgetOwnerIds, selectedIds)) {
      return this.previousBudgeOwnerDisplay;
    }
    this.previousBudgetOwnerIds = selectedIds;
    this.previousBudgeOwnerDisplay = this.renderReadonlyUserDetails(users, selectedIds);
    return this.previousBudgeOwnerDisplay;
  }

  /**
   * Optimization to avoid multiple calls to filter through the long users array
   */
  previousFocalPointsIds: string[] = [];
  previousFocalPointsDisplay: TemplateResult | TemplateResult[] = html`—`;
  renderReadonlyFocalPoints(users: AnyObject[], selectedIds: string[]) {
    if (users == undefined) {
      return html`—`;
    }
    if (areEqual(this.previousFocalPointsIds, selectedIds)) {
      return this.previousFocalPointsDisplay;
    }
    this.previousFocalPointsIds = selectedIds;
    this.previousFocalPointsDisplay = this.renderReadonlyUserDetails(users, selectedIds);
    return this.previousFocalPointsDisplay;
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }

    return getStore()
      .dispatch(patchIntervention(this.data))
      .then(() => {
        this.editMode = false;
      });
  }
}
