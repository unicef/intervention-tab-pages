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
import {RootState} from '../../common/types/store.types';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, Permission, PartnerStaffMember, AnyObject, EtoolsUser} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import '../../common/components/intervention/partner-focal-points';

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
              ?readonly="${!this.editMode}"
              always-float-label
            >
            </paper-input>
          </div>
        </div>
        <div class="row-padding-v">
          <div class="col col-7 layout-vertical">
            <label class="paper-label">Partner Focal Points</label>
            <partner-focal-points
              .user="${this.user}"
              .items="${this.data.partner_focal_points?.map((f: any) => f.email)}"
              ?readonly="${!this.editMode}"
            ></partner-focal-points>
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
  partnerStaffMembers!: PartnerStaffMember[];

  @property({type: Object})
  user!: EtoolsUser;

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

    this.data = cloneDeep(selectPartnerDetails(state));
    this.permissions = selectPartnerDetailsPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
    this.user = state.user?.data!;
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
