import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {selectPdUnicefDetails, selectPdUnicefDetailsPermissions} from './pdUnicefDetails.selectors';
import {PdUnicefDetailsPermissions, PdUnicefDetails} from './pdUnicefDetails.models';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {patchIntervention} from '../../common/actions/interventions';
import {RootState} from '../../common/types/store.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import orderBy from 'lodash-es/orderBy';
import {AnyObject, CountryProgram, Permission, AsyncAction, User} from '@unicef-polymer/etools-types';
import isEmpty from 'lodash-es/isEmpty';
import uniqBy from 'lodash-es/uniqBy';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {translatesMap} from '../../utils/intervention-labels-map';

/**
 * @customElement
 */
@customElement('unicef-details')
export class UnicefDetailsElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    // language=HTML
    if (!this.data) {
      return html` ${sharedStyles}
        <etools-loading source="unicefDetails" active></etools-loading>`;
    }
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }
        .placeholder {
          color: var(--secondary-text-color);
        }
        .padd-top {
          padding-top: 4px;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title="${translate('UNICEF_DETAILS')}"
        comment-element="unicef-details"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row">
          <div class="col-xl-4 col-md-6 col-12">
            <etools-dropdown-multi
              id="officeInput"
              label=${translate(translatesMap.offices)}
              class="row-padding-v"
              .options="${this.office_list}"
              option-label="name"
              option-value="id"
              .selectedValues="${this.data.offices}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.offices)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.offices) ? -1 : undefined}"
              ?required="${this.permissions?.required.offices}"
              @etools-selected-items-changed="${({detail}: CustomEvent) =>
                this.selectedItemsChanged(detail, 'offices')}"
              trigger-value-change-event
            >
            </etools-dropdown-multi>
          </div>
          <div class="col-xl-4 col-md-6 col-12">
            <etools-dropdown-multi
              id="sectionInput"
              label=${translate(translatesMap.sections)}
              class="w100"
              .options="${this.section_list}"
              option-label="name"
              option-value="id"
              .selectedValues="${this.data.sections}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.sections)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.sections) ? -1 : undefined}"
              ?required="${this.permissions?.required.sections}"
              @etools-selected-items-changed="${({detail}: CustomEvent) =>
                this.selectedItemsChanged(detail, 'sections')}"
              trigger-value-change-event
            >
            </etools-dropdown-multi>
          </div>
          <div class="col-xl-4 col-md-6 col-12" ?hidden="${!this.isUnicefUser}">
            <etools-dropdown-multi
              id="cpStructures"
              label=${translate('CP_STRUCTURES')}
              .options="${this.cpStructures}"
              class="w100"
              option-label="name"
              option-value="id"
              .selectedValues="${this.data.country_programmes}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.country_programmes)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.country_programmes) ? -1 : undefined}"
              ?required="${this.permissions?.required.country_programmes}"
              @etools-selected-items-changed="${({detail}: CustomEvent) =>
                this.selectedItemsChanged(detail, 'country_programmes')}"
              trigger-value-change-event
            >
            </etools-dropdown-multi>
          </div>
          ${this.permissions?.view!.unicef_focal_points
            ? html`<div class="col-xl-4 col-md-6 col-12">
                <etools-dropdown-multi
                  id="focalPointInput"
                  label=${translate('UNICEF_FOCAL_POINTS')}
                  class="w100"
                  .options="${this.users_list}"
                  option-label="name"
                  option-value="id"
                  .selectedValues="${this.data.unicef_focal_points.map((u: any) => u.id)}"
                  ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit.unicef_focal_points)}"
                  ?required="${this.permissions?.required.unicef_focal_points}"
                  @etools-selected-items-changed="${({detail}: CustomEvent) =>
                    this.selectedUsersChanged(detail, 'unicef_focal_points')}"
                  trigger-value-change-event
                >
                </etools-dropdown-multi>
                <div
                  class="padd-top"
                  ?hidden="${!this.isReadonly(this.editMode, this.permissions?.edit.unicef_focal_points)}"
                >
                  <label for="focalPointInput" class="label">${translate('UNICEF_FOCAL_POINTS')}</label>
                  <div id="focalPointDetails">
                    ${this.renderReadonlyUserDetails(
                      this.originalData?.unicef_focal_points ? this.originalData?.unicef_focal_points! : []
                    )}
                  </div>
                </div>
              </div>`
            : ''}

          <div class="col-xl-4 col-md-6 col-12" ?hidden="${!this.isUnicefUser}">
            <etools-dropdown
              id="budgetOwnerInput"
              label=${translate('UNICEF_BUDGET_OWNER')}
              .options="${this.users_list}"
              enable-none-option
              class="w100"
              option-label="name"
              option-value="id"
              .selected="${this.data.budget_owner?.id}"
              ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit.budget_owner)}"
              ?required="${this.permissions?.required.budget_owner}"
              @etools-selected-item-changed="${({detail}: CustomEvent) =>
                this.selectedUserChanged(detail, 'budget_owner')}"
              trigger-value-change-event
            >
            </etools-dropdown>

            <div class="padd-top" ?hidden="${!this.isReadonly(this.editMode, this.permissions?.edit.budget_owner)}">
              <label for="budgetOwnerInput" class="label">${translate('UNICEF_BUDGET_OWNER')}</label>
              <div id="budgetOwnerDetails">
                ${this.renderReadonlyUserDetails(
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

  private _cpStructures: CountryProgram[] = [];
  @property({type: Array})
  get cpStructures() {
    return this._cpStructures;
  }

  set cpStructures(cps) {
    this._cpStructures = orderBy<CountryProgram>(cps, ['future', 'active', 'special'], ['desc', 'desc', 'asc']);
  }

  @property({type: Object})
  permissions!: Permission<PdUnicefDetailsPermissions>;

  @property({type: Boolean})
  isUnicefUser = false;

  @property({type: Array})
  users_list!: User[];

  @property({type: Array})
  office_list!: AnyObject[];

  @property({type: Array})
  section_list!: AnyObject[];

  stateChanged(state: RootState) {
    if (
      EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'metadata') ||
      !state.interventions.current
    ) {
      return;
    }

    if (!this.dataRequiredByDropdownsHasBeenLoaded(state)) {
      return;
    }

    if (state.user && state.user.data) {
      this.isUnicefUser = state.user.data.is_unicef_user;
    }
    if (state.interventions.current && !isJsonStrMatch(this.originalData, selectPdUnicefDetails(state))) {
      this.data = cloneDeep(selectPdUnicefDetails(state));
      this.originalData = cloneDeep(this.data);
    }
    this.setPermissions(state);
    this.populateDropdownOptions(state);
    super.stateChanged(state);
  }

  dataRequiredByDropdownsHasBeenLoaded(state: RootState) {
    return Boolean(state.commonData?.loadedTimestamp);
  }

  private setPermissions(state: any) {
    const permissions = selectPdUnicefDetailsPermissions(state);
    if (!isJsonStrMatch(this.permissions, permissions)) {
      this.permissions = permissions;
      this.set_canEditAtLeastOneField(this.permissions.edit);
    }
  }

  populateDropdownOptions(state: any) {
    if (get(state, 'commonData.unicefUsersData.length')) {
      this.users_list = [...state.commonData!.unicefUsersData];
    }
    if (get(state, 'commonData.sections.length')) {
      this.section_list = [...state.commonData!.sections];
    }
    if (get(state, 'commonData.offices.length')) {
      this.office_list = [...state.commonData!.offices];
    }
    if (!isJsonStrMatch(this.cpStructures, state.commonData!.countryProgrammes)) {
      this.cpStructures = [...state.commonData!.countryProgrammes];
    }

    const pdUsers = this.getUsersAssignedToCurrentPD();
    if (this.isUnicefUser) {
      // Partner user can not edit these fields
      const changed = this.handleUsersNoLongerAssignedToCurrentCountry(this.users_list, pdUsers);
      if (changed) {
        this.users_list = [...this.users_list];
      }
    } else {
      this.users_list = pdUsers;
    }
  }

  getUsersAssignedToCurrentPD() {
    const savedUsers = [];
    if (this.data.budget_owner) {
      savedUsers.push(this.data.budget_owner);
    }
    if (!isEmpty(this.data.unicef_focal_points)) {
      savedUsers.push(this.data.unicef_focal_points);
    }
    return uniqBy(savedUsers.flat(), 'id');
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }

    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.formatUsersData(this.data)))
      .then(() => {
        this.editMode = false;
      });
  }

  private formatUsersData(data: PdUnicefDetails) {
    const dataToSave: AnyObject = cloneDeep(data);
    dataToSave.budget_owner = data.budget_owner ? data.budget_owner.id : null;
    dataToSave.unicef_focal_points = data.unicef_focal_points.map((u: any) => u.id);
    return dataToSave;
  }
}
