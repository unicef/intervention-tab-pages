import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-upload';

import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import UploadMixin from '@unicef-polymer/etools-modules-common/dist/mixins/uploads-mixin';
import CONSTANTS from '../../common/constants';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

import {RootState} from '../../common/types/store.types';
import {selectReviewData, selectDatesAndSignaturesPermissions} from '../../common/managementDocument.selectors';
import {ReviewDataPermission, ReviewData} from './managementDocument.model';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';

import {getDifference} from '@unicef-polymer/etools-modules-common/dist/mixins/objects-diff';
import {patchIntervention} from '../../common/actions/interventions';
import {formatDate} from '@unicef-polymer/etools-utils/dist/date.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, EtoolsEndpoint, MinimalUser, Permission, User} from '@unicef-polymer/etools-types';
import {MinimalAgreement} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {sectionContentStyles} from '@unicef-polymer/etools-modules-common/dist/styles/content-section-styles-polymer';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {EtoolsUpload} from '@unicef-polymer/etools-unicef/src/etools-upload';
import {RequestEndpoint} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';

/**
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin UploadsMixin
 */
@customElement('review-and-sign')
export class InterventionReviewAndSign extends CommentsMixin(ComponentBaseMixin(UploadMixin(LitElement))) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    if (!this.data || !this.permissions) {
      return html` ${sharedStyles}
        <etools-loading source="revAndSign" active></etools-loading>`;
    }
    return html`
    ${sharedStyles}
      <style>
        ${sectionContentStyles}:host {
          display: flex;
          flex-direction: column;
          width: 100%;
          display: block;
          margin-bottom: 24px;
        }

        input-container {
          margin-inline-start: 0px;
        }

        etools-input {
          width: 100%;
        }

        datepicker-lite {
          min-width: 100%;
        }
        .content-wrapper {
          padding: 0;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
        .input-container {
          margin: 0 12px 0 0;
          color: var(--primary-text-color, #737373);
          padding: 8px 0;
          display: block;
        }
        .input-container .input-value {
          padding: 3px 0;
        }
      </style>
      <etools-content-panel
        show-expand-btn class="content-section"
        panel-title=${translate('SIGNATURES_DATES')}
        comment-element="signatures-and-dates"
      >
        <div slot="panel-btns">
          ${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}
        </div>
        <div class="row">
          <div class="col-md-6 col-12">
            <!-- Signed By Partner Authorized Officer -->
            <etools-dropdown
              id="signedByAuthorizedOfficer"
              label=${translate('SIGNED_PARTNER_AUTH_OFFICER')}
              placeholder="&#8212;"
              .options="${this.agreementAuthorizedOfficers}"
              .selected="${this.data.partner_authorized_officer_signatory?.id}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.partner_authorized_officer_signatory)}"
              ?required="${this.permissions?.required.partner_authorized_officer_signatory}"
              auto-validate
              option-value="id"
              option-label="name"
              error-message=${translate('PARTNER_AUTH_OFFICER_ERR')}
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                if (!detail.selectedItem) {
                  return;
                }
                this.selectedUserChanged(detail, 'partner_authorized_officer_signatory');
              }}"
              trigger-value-change-event
              ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit.partner_authorized_officer_signatory)}"
            >
            </etools-dropdown>
            ${
              this.isReadonly(this.editMode, this.permissions?.edit.partner_authorized_officer_signatory)
                ? html`<label for="partnerAuth" class="label"> ${translate('SIGNED_PARTNER_AUTH_OFFICER')} </label>
                    <div id="partnerAuth">
                      ${this.renderReadonlyUserDetails(
                        this.originalData?.partner_authorized_officer_signatory
                          ? [this.originalData?.partner_authorized_officer_signatory]
                          : []
                      )}
                    </div>`
                : html``
            }
          </div>
          <div class="col-md-6 col-12">
            <!-- Signed by Partner Date -->
            <datepicker-lite
              id="signedByPartnerDateField"
              label=${translate('SIGNED_PARTNER_DATE')}
              .value="${this.data.signed_by_partner_date}"
              ?required="${this.permissions?.required.signed_by_partner_date}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.signed_by_partner_date)}"
              fire-date-has-changed
              @date-has-changed="${(e: CustomEvent) =>
                this.valueChanged({value: formatDate(e.detail.date, 'YYYY-MM-DD')}, 'signed_by_partner_date')}"
              ?auto-validate="${this.editMode}"
              error-message=${translate('DATE_REQUIRED')}
              max-date-error-msg=${translate('MAX_DATE_ERR')}
              max-date="${this.getCurrentDate()}"
              selected-date-display-format="D MMM YYYY"
            >
            </datepicker-lite>
          </div>
          <div class="col-md-6 col-12">
            <!-- Signed by UNICEF Authorized Officer -->
            <div class="input-container">
                <span class="input-value">${translate('SIGNED_UNICEF_AUTH_OFFICER')}</span>
            </div>
          </div>
          <div class="col-md-6 col-12">
            <!-- Signed by UNICEF Date -->
            <datepicker-lite
              id="signedByUnicefDateField"
              label=${translate('SIGNED_UNICEF_DATE')}
              .value="${this.data.signed_by_unicef_date}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.signed_by_unicef_date)}"
              ?required="${this.permissions?.required.signed_by_unicef_date}"
              fire-date-has-changed
              @date-has-changed="${(e: CustomEvent) =>
                this.valueChanged({value: formatDate(e.detail.date, 'YYYY-MM-DD')}, 'signed_by_unicef_date')}"
              ?auto-validate="${this.editMode}"
              error-message=${translate('DATE_REQUIRED')}
              max-date-error-msg=${translate('MAX_DATE_ERR')}
              max-date="${this.getCurrentDate()}"
              selected-date-display-format="D MMM YYYY"
            >
            </datepicker-lite>
           </div>
          <div class="col-md-6 col-12">
            <!-- Signed by UNICEF -->
            <etools-dropdown
              id="signedByUnicef"
              label=${translate('SIGNED_UNICEF')}
              placeholder="&#8212;"
              .options="${this.signedByUnicefUsers}"
              option-value="id"
              option-label="name"
              .selected="${this.data.unicef_signatory?.id}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.unicef_signatory)}"
              auto-validate
              error-message=${translate('UNICEF_USER_ERR')}
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                if (!detail.selectedItem) {
                  return;
                }
                this.selectedUserChanged(detail, 'unicef_signatory');
              }}"
              trigger-value-change-event
              ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit.unicef_signatory)}"
            >
            </etools-dropdown>
            ${
              this.isReadonly(this.editMode, this.permissions?.edit.unicef_signatory)
                ? html`<label for="unicefSignatory" class="label">${translate('SIGNED_UNICEF')}</label>
                    <div id="unicefSignatory">
                      ${this.renderReadonlyUserDetails(
                        this.originalData?.unicef_signatory ? [this.originalData?.unicef_signatory] : []
                      )}
                    </div>`
                : html``
            }
          </div>
          <div class="col-md-9 col-12">
            <!-- Signed PD/SPD -->
            <etools-upload
              id="signedIntervFile"
              label=${translate('SIGNED_PD_SPD')}
              accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.txt"
              .fileUrl="${this.data.signed_pd_attachment}"
              .uploadEndpoint="${this.uploadEndpoint}"
              .showDeleteBtn="${this.showSignedPDDeleteBtn(this.data.status)}"
              @delete-file="${this._signedPDDocDelete}"
              ?auto-validate="${this.editMode}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.signed_pd_attachment)}"
              ?required="${this.permissions?.required.signed_pd_attachment}"
              error-message=${translate('SELECT_SIGNED_PD_SPD_DOC')}
              @upload-started="${this.__onUploadStarted}"
              @upload-finished="${this._signedPDUploadFinished}"
              @change-unsaved-file="${this._onChangeUnsavedFile}"
            >
            </etools-upload>
          </div>
          <div class="col-md-9 col-12">
            <!-- TERMINATION DOC -->
            <etools-upload
              id="terminationDoc"
              label=${translate('TERMINATION_NOTICE')}
              .hidden="${!this.data.termination_doc_attachment}"
              .fileUrl="${this.data.termination_doc_attachment}"
              readonly
            >
          </div>
        </div>
        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: String})
  uploadEndpoint: string = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.attachmentsUpload).url;

  @property({type: Object})
  originalData!: ReviewData;

  @property({type: Object})
  data!: ReviewData;

  @property({type: Object})
  permissions!: Permission<ReviewDataPermission>;

  @property({type: Array})
  signedByUnicefUsers!: User[] | MinimalUser[];

  @property({type: Array})
  agreementAuthorizedOfficers!: any;

  @property({type: String})
  partnerDateValidatorErrorMessage!: string;

  @property({type: String})
  unicefDateValidatorErrorMessage!: string;

  @property({type: Boolean})
  isUnicefUser = false;

  private justUploaded = false;

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'metadata')) {
      return;
    }

    if (state.uploadStatus.uploadsInProgress || state.uploadStatus.unsavedUploads || this.justUploaded) {
      setTimeout(() => (this.justUploaded = false), 200);
      return; // Prevent upload related redux store changes (UploadMixin) from reseting data selected in other fields
    }

    if (!isJsonStrMatch(this.signedByUnicefUsers, state.commonData!.unicefUsersData)) {
      this.signedByUnicefUsers = cloneDeep(state.commonData!.unicefUsersData);
    }
    if (state.user && state.user.data) {
      this.isUnicefUser = state.user.data.is_unicef_user;
    }

    if (state.interventions.current) {
      const reviewData = selectReviewData(state);
      if (!isJsonStrMatch(this.originalData, reviewData)) {
        this.data = cloneDeep(reviewData);
        this.originalData = cloneDeep(this.data);
        const permissions = selectDatesAndSignaturesPermissions(state);
        if (!isJsonStrMatch(this.permissions, permissions)) {
          this.permissions = permissions;
          this.set_canEditAtLeastOneField(this.permissions.edit);
        }
        const agreements = state.agreements.list;
        if (!isEmpty(agreements)) {
          const agreementData = this.filterAgreementsById(agreements!, this.data.agreement);
          this.agreementAuthorizedOfficers = this.getAuthorizedOfficersList(agreementData);
          const changed = this.handleUsersNoLongerAssignedToCurrentCountry(
            this.agreementAuthorizedOfficers as User[],
            this.data.partner_authorized_officer_signatory
              ? [this.data.partner_authorized_officer_signatory as MinimalUser]
              : []
          );
          if (changed) {
            this.agreementAuthorizedOfficers = [...this.agreementAuthorizedOfficers];
          }
        }

        const pdUsers = this.data.unicef_signatory ? [this.data.unicef_signatory] : [];
        if (this.isUnicefUser) {
          // Partner user can not edit this field
          const changed = this.handleUsersNoLongerAssignedToCurrentCountry(this.signedByUnicefUsers as User[], pdUsers);
          if (changed) {
            this.signedByUnicefUsers = [...this.signedByUnicefUsers];
          }
        } else {
          this.signedByUnicefUsers = pdUsers;
        }
      }
    }
    super.stateChanged(state);
  }

  getAuthorizedOfficersList(agreementData: any) {
    if (!agreementData) {
      return null;
    }
    return agreementData.authorized_officers!.map((officer: any) => {
      officer.id = typeof officer.id === 'string' ? parseInt(officer.id, 10) : officer.id;
      officer.name = officer.first_name + ' ' + officer.last_name;
      return officer;
    });
  }

  filterAgreementsById(agreements: MinimalAgreement[], agreementId: string) {
    return agreements.filter((a: any) => String(a.id) === String(agreementId))[0];
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _isDraft(status: string) {
    return status === CONSTANTS.STATUSES.Draft.toLowerCase() || status === '';
  }

  _hideDeleteBtn(status: string, fileUrl: string) {
    return this._isDraft(status) && fileUrl;
  }
  __onUploadStarted(e: CustomEvent) {
    this.justUploaded = true;
    this._onUploadStarted(e);
  }

  cancel() {
    super.cancel();
    // @ts-ignore
    const uploadElem = this.shadowRoot?.querySelector('#signedIntervFile') as EtoolsUpload;
    // @ts-ignore
    uploadElem._cancelUpload();

    this.decreaseUnsavedUploads();
    this.justUploaded = false;
  }

  validate() {
    let valid = true;
    const fieldSelectors = [
      '#signedByAuthorizedOfficer',
      '#signedByPartnerDateField',
      '#signedByUnicefDateField',
      '#signedIntervFile',
      '#submissionDateField'
    ];
    fieldSelectors.forEach((selector: string) => {
      const field = this.shadowRoot!.querySelector(selector) as LitElement & {validate(): boolean};
      if (field && !field.validate()) {
        valid = false;
      }
    });
    return valid;
  }

  _signedPDUploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const response = e.detail.success;
      this.data.signed_pd_attachment = response.id;
      this.requestUpdate();
    }
    this.justUploaded = true;
    // Called also after upload was cancelled
    this._onUploadFinished(e.detail.success);
  }

  _signedPDDocDelete(_e: CustomEvent) {
    this.data.signed_pd_attachment = null;
    this._onUploadDelete();
  }

  showSignedPDDeleteBtn(status: string) {
    return this._isDraft(status) && !!this.originalData && !this.originalData.signed_pd_attachment;
  }

  getCurrentDate() {
    return new Date();
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }

    return getStore()
      .dispatch<AsyncAction>(
        // @ts-ignore
        patchIntervention(this.formatUserData(getDifference<ReviewData>(this.originalData, this.data)))
      )
      .then(() => {
        this._onUploadSaved();
        this.editMode = false;
      });
  }

  private formatUserData(data: ReviewData) {
    const dataToSave: any = cloneDeep(data);
    dataToSave.unicef_signatory = data.unicef_signatory?.id;

    dataToSave.partner_authorized_officer_signatory = data.partner_authorized_officer_signatory?.id;
    return dataToSave;
  }
}
