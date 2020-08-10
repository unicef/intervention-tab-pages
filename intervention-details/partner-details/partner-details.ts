import {LitElement, html, property, customElement} from 'lit-element';
import {Permission} from '../../common/models/intervention.types';
import {selectPartnerDetails, selectPartnerDetailsPermissions} from './partnerDetails.selectors';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {buttonsStyles} from '../../common/styles/button-styles';
import {PartnerDetails, PartnerDetailsPermissions} from './partnerDetails.models';
import {getStore} from '../../utils/redux-store-access';
import {connect} from 'pwa-helpers/connect-mixin';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {validateRequiredFields} from '../../utils/validation-helper';
import {patchIntervention} from '../../common/actions';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import {isJsonStrMatch} from '../../utils/utils';
// import {isUnicefUSer} from '../../common/selectors';
import isEmpty from 'lodash-es/isEmpty';
import {PartnerStaffMember} from '../../common/models/partner.types';
import {MinimalAgreement} from '../../common/models/agreement.types';

/**
 * @customElement
 */
@customElement('partner-details')
export class PartnerDetailsElement extends connect(getStore())(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [buttonsStyles, gridLayoutStylesLit];
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
      </style>

      <etools-content-panel show-expand-btn panel-title="Partner Details">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>

        <div slot="panel-btns">
          ${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}
        </div>

        <div class="row-padding-v layout-horizontal">
          <div class="col col-7">
            <paper-input
              class="w100"
              label="Partner Organization"
              .value="${this.data.partner}"
              required
              readonly
              always-float-label
            >
            </paper-input>
          </div>
          <div class="col col-5">
            <etools-dropdown
              id="agreements"
              label="Agreements"
              .options="${this.partnerAgreements}"
              .selected="${this.data.agreement}"
              option-value="id"
              option-label="agreement_number_status"
              trigger-value-change-event
              @etools-selected-item-changed="${({detail}: CustomEvent) => this.selectedAgreementChanged(detail)}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.agreement)}"
              required
              auto-validate
            >
            </etools-dropdown>
          </div>
        </div>
        <div class="row-padding-v layout-horizontal">
          <div class="col col-7">
            <paper-input
              class="w100"
              label="Partner Vendor Number"
              .value="${this.data.partner_vendor}"
              required
              readonly
              always-float-label
            >
            </paper-input>
          </div>
          <div class="col col-5 layout-vertical">
            <label for="agreementAuthOff" class="paper-label">Agreement Authorized Officers</label>
            <div id="agreementAuthOff">
              ${this.renderAgreementAuthorizedOfficers(this.agreementAuthorizedOfficers)}
            </div>
          </div>
        </div>
        <div class="row-padding-v">
          <div class="col col-7 layout-vertical">
            <etools-dropdown-multi
              label="Partner Focal Points"
              .selectedValues="${cloneDeep(this.data.partner_focal_points)}"
              .options="${this.partnerStaffMembers}"
              option-label="name"
              option-value="id"
              trigger-value-change-event
              @etools-selected-items-changed="${({detail}: CustomEvent) =>
                this.selectedItemsChanged(detail, 'partner_focal_points')}"
              ?hidden="${this.isReadonly(this.editMode, this.permissions.edit.partner_focal_points)}"
            >
            </etools-dropdown-multi>
            ${this.isReadonly(this.editMode, this.permissions.edit.partner_focal_points)
              ? html`<label for="focalPointsDetails" class="paper-label">Partner Focal Points</label>
                  <div id="focalPointsDetails">
                    ${this.renderReadonlyPartnerFocalPoints(this.partnerStaffMembers, this.data.partner_focal_points!)}
                  </div>`
              : html``}
          </div>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  originalData!: PartnerDetails;

  @property({type: Object})
  data!: PartnerDetails;

  @property({type: Object})
  permissions!: Permission<PartnerDetailsPermissions>;

  @property({type: Boolean})
  showLoading = false;

  @property({type: Array})
  partnerAgreements!: MinimalAgreement[];

  @property({type: Array})
  agreementAuthorizedOfficers!: PartnerStaffMember[];

  @property({type: Array})
  partnerStaffMembers!: PartnerStaffMember[];

  connectedCallback() {
    super.connectedCallback();
  }

  async stateChanged(state: any) {
    if (!state.interventions.current) {
      return;
    }
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'details')) {
      return;
    }

    await this.setPartnerDetailsAndPopulateDropdowns(state);

    this.permissions = selectPartnerDetailsPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
  }

  async setPartnerDetailsAndPopulateDropdowns(state: any) {
    const newPartnerDetails = selectPartnerDetails(state);

    const agreements = get(state, 'agreements.list');
    if (!isEmpty(agreements)) {
      this.partnerAgreements = this.filterAgreementsByPartner(agreements, newPartnerDetails.partner_id!);
    }

    if (!isJsonStrMatch(this.originalData, newPartnerDetails)) {
      if (this.partnerIdHasChanged(newPartnerDetails)) {
        this.partnerStaffMembers = await this.getAllPartnerStaffMembers(newPartnerDetails.partner_id!);
      }
      this.data = newPartnerDetails;
      this.originalData = cloneDeep(this.data);
    }
  }

  filterAgreementsByPartner(agreements: MinimalAgreement[], partnerId: number) {
    return agreements.filter((a: any) => String(a.partner) === String(partnerId));
  }

  partnerIdHasChanged(newPartnerDetails: PartnerDetails) {
    return get(this.data, 'partner_id') !== newPartnerDetails.partner_id;
  }

  getAllPartnerStaffMembers(partnerId: number) {
    return sendRequest({
      endpoint: getEndpoint(interventionEndpoints.partnerStaffMembers, {id: partnerId})
    }).then((resp) => {
      resp.forEach((staff: PartnerStaffMember) => {
        staff.name = staff.first_name + ' ' + staff.last_name;
      });
      return resp;
    });
  }

  selectedAgreementChanged(detail: any) {
    this.selectedItemChanged(detail, 'agreement');
    this.agreementAuthorizedOfficers = detail.selectedItem?.authorized_officers;
  }

  renderAgreementAuthorizedOfficers(authOfficers: PartnerStaffMember[]) {
    if (isEmpty(authOfficers)) {
      return html`—`;
    } else {
      return authOfficers.map((authOfficer) => {
        return html`<div class="w100">
          ${this.renderNameEmailPhone(authOfficer)}
        </div>`;
      });
    }
  }

  renderReadonlyPartnerFocalPoints(partnerStaffMembers: PartnerStaffMember[], partnerFocalPoints: number[]) {
    if (isEmpty(partnerStaffMembers) || isEmpty(partnerFocalPoints)) {
      return html`—`;
    }
    const focalPointDetails = partnerStaffMembers.filter((staff) => partnerFocalPoints.includes(staff.id!));
    if (isEmpty(focalPointDetails)) {
      return html``;
    } else {
      return focalPointDetails.map((focal: any) => {
        return html`<div class="w100">
          ${this.renderNameEmailPhone(focal)}
        </div>`;
      });
    }
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
