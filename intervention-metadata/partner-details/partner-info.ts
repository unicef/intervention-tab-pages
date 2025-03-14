import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {selectPartnerDetails, selectPartnerDetailsPermissions} from './partnerInfo.selectors';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';

import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';

import {PartnerInfo, PartnerInfoPermissions} from './partnerInfo.models';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {patchIntervention} from '../../common/actions/interventions';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import isEmpty from 'lodash-es/isEmpty';
import {RootState} from '../../common/types/store.types';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, Permission, PartnerStaffMember, AnyObject} from '@unicef-polymer/etools-types';
import {MinimalAgreement} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation, langChanged} from '@unicef-polymer/etools-unicef/src/etools-translate';

/**
 * @customElement
 */
@customElement('partner-info')
export class PartnerInfoElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
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
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row">
          <div class="col-md-8 col-12">
            <etools-input
              class="w100"
              label=${translate('PARTNER_ORGANIZATION')}
              .value="${this.data?.partner}"
              required
              readonly
              always-float-label
              tabindex="-1"
            >
            </etools-input>
          </div>
          <div class="col-md-4 col-12">
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
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.agreement) ? -1 : undefined}"
              required
              auto-validate
            >
            </etools-dropdown>
          </div>
          <div class="col-md-8 col-12">
            <etools-input
              class="w100"
              label=${translate('PARTNER_VENDOR_NUMBER')}
              .value="${this.data?.partner_vendor}"
              tabindex="-1"
              readonly
              always-float-label
            >
            </etools-input>
          </div>
          <div class="col-md-4 col-12">
            <label for="agreementAuthOff" class="label">${translate('AGREEMENT_AUTHORIZED_OFFICERS')}</label>
            <div id="agreementAuthOff">${this.renderAgreementAuthorizedOfficers(this.agreementAuthorizedOfficers)}</div>
          </div>
          <div class="col-md-8 col-12" ?hidden="${!this.permissions?.view!.partner_focal_points}">
            <etools-dropdown-multi
              label=${translate('PARTNER_FOCAL_POINTS')}
              .selectedValues="${this.data?.partner_focal_points?.map((f: any) => f.id)}"
              .options="${langChanged(() => this.formattedPartnerStaffMembers)}"
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
              ? html`<label for="focalPointsDetails" class="label">${translate('PARTNER_FOCAL_POINTS')}</label>
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

  get formattedPartnerStaffMembers() {
    return this.partnerStaffMembers?.map((member: PartnerStaffMember) => ({
      name: `${
        !member.active
          ? `[${getTranslation('INACTIVE')}]`
          : member.has_active_realm
            ? ''
            : `[${getTranslation('NO_ACCESS')}]`
      } ${member.first_name} ${member.last_name} (${member.email})`,
      id: member.id
    }));
  }

  connectedCallback() {
    super.connectedCallback();
  }

  async stateChanged(state: RootState) {
    if (
      !state.interventions.current ||
      EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'metadata')
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
      const partnerIdHasChanged = this.partnerIdHasChanged(newPartnerDetails);
      if (partnerIdHasChanged) {
        this.partnerStaffMembers = await this.getAllPartnerStaffMembers(newPartnerDetails.partner_id!);
      }
      // Wait for partnerStaffMembers to be set, to avoid timing issues on dropdown selectedItems
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
      return resp.sort(
        (a: PartnerStaffMember, b: PartnerStaffMember) =>
          Number(b.active) - Number(a.active) ||
          `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      );
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
