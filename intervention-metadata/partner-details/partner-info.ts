import {LitElement, html, property, customElement} from 'lit-element';
import {selectPartnerDetails, selectPartnerDetailsPermissions} from './partnerInfo.selectors';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {PartnerInfo, PartnerInfoPermissions} from './partnerInfo.models';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {patchIntervention} from '../../common/actions/interventions';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {isJsonStrMatch} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import isEmpty from 'lodash-es/isEmpty';
import {RootState} from '../../common/types/store.types';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, Permission, PartnerStaffMember, AnyObject} from '@unicef-polymer/etools-types';
import {MinimalAgreement} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

/**
 * @customElement
 */
@customElement('partner-info')
export class PartnerInfoElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [buttonsStyles, gridLayoutStylesLit];
  }
  render() {
    // language=HTML
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

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title="${translate('PARTNER_DETAILS')}"
        comment-element="partner-details"
        comment-description=${translate('PARTNER_DETAILS')}
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row-padding-v layout-horizontal">
          <div class="col col-7">
            <paper-input
              class="w100"
              label=${translate('PARTNER_ORGANIZATION')}
              .value="${this.data?.partner}"
              required
              readonly
              always-float-label
              tabindex="-1"
            >
            </paper-input>
          </div>
          <div class="col col-5">
            <etools-dropdown
              id="agreements"
              label=${translate('AGREEMENTS')}
              .options="${this.partnerAgreements}"
              .selected="${this.data?.agreement}"
              option-value="id"
              option-label="agreement_number_status"
              trigger-value-change-event
              @etools-selected-item-changed="${({detail}: CustomEvent) => this.selectedAgreementChanged(detail)}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.agreement)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.agreement) ? -1 : 0}"
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
              label=${translate('PARTNER_VENDOR_NUMBER')}
              .value="${this.data?.partner_vendor}"
              tabindex="-1"
              readonly
              always-float-label
            >
            </paper-input>
          </div>
          <div class="col col-5 layout-vertical">
            <label for="agreementAuthOff" class="paper-label">${translate('AGREEMENT_AUTHORIZED_OFFICERS')}</label>
            <div id="agreementAuthOff">${this.renderAgreementAuthorizedOfficers(this.agreementAuthorizedOfficers)}</div>
          </div>
        </div>
        <div class="row-padding-v">
          <div class="col col-7 layout-vertical" ?hidden="${!this.permissions?.view!.partner_focal_points}">
            <etools-dropdown-multi
              label=${translate('PARTNER_FOCAL_POINTS')}
              .selectedValues="${this.data?.partner_focal_points?.map((f: any) => f.id)}"
              .options="${this.partnerStaffMembers}"
              option-label="name"
              option-value="id"
              ?required=${this.permissions?.required.partner_focal_points}
              trigger-value-change-event
              @etools-selected-items-changed="${({detail}: CustomEvent) =>
                this.selectedUsersChanged(detail, 'partner_focal_points')}"
              ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit.partner_focal_points)}"
            >
            </etools-dropdown-multi>
            ${this.isReadonly(this.editMode, this.permissions?.edit.partner_focal_points)
              ? html`<label for="focalPointsDetails" class="paper-label">${translate('PARTNER_FOCAL_POINTS')}</label>
                  <div id="focalPointsDetails">
                    ${this.renderReadonlyUserDetails(
                      this.originalData?.partner_focal_points ? this.originalData?.partner_focal_points : []
                    )}
                  </div>`
              : html``}
          </div>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  originalData!: PartnerInfo;

  @property({type: Object})
  data!: PartnerInfo;

  @property({type: Object})
  permissions!: Permission<PartnerInfoPermissions>;

  @property({type: Array})
  partnerAgreements!: MinimalAgreement[];

  @property({type: Array})
  agreementAuthorizedOfficers!: PartnerStaffMember[];

  @property({type: Array})
  partnerStaffMembers!: PartnerStaffMember[];

  connectedCallback() {
    super.connectedCallback();
  }

  async stateChanged(state: RootState) {
    if (
      !state.interventions.current ||
      pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'metadata')
    ) {
      return;
    }

    super.stateChanged(state);
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
      this.data = cloneDeep(newPartnerDetails);
      this.originalData = cloneDeep(this.data);
    }
  }

  filterAgreementsByPartner(agreements: MinimalAgreement[], partnerId: number) {
    return agreements.filter((a: any) => String(a.partner) === String(partnerId));
  }

  partnerIdHasChanged(newPartnerDetails: PartnerInfo) {
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
    if (!detail || !detail.selectedItem) {
      return;
    }
    this.selectedItemChanged(detail, 'agreement');
    this.agreementAuthorizedOfficers = detail.selectedItem?.authorized_officers;
  }

  renderAgreementAuthorizedOfficers(authOfficers: PartnerStaffMember[]) {
    if (isEmpty(authOfficers)) {
      return html`—`;
    } else {
      return authOfficers.map((authOfficer) => {
        return html`<div class="w100 padd-between">${this.renderNameEmailPhone(authOfficer)}</div>`;
      });
    }
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
  private formatUsersData(data: PartnerInfo) {
    const dataToSave: AnyObject = cloneDeep(data);
    dataToSave.partner_focal_points = data.partner_focal_points.map((u: any) => u.id);
    return dataToSave;
  }
}
