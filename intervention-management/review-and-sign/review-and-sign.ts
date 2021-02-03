import {customElement, LitElement, html, property} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-checkbox';

import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-upload/etools-upload';

import '@unicef-polymer/etools-date-time/datepicker-lite';
import DatePickerLite from '@unicef-polymer/etools-date-time/datepicker-lite';

import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import UploadMixin from '../../common/mixins/uploads-mixin';
import CONSTANTS from '../../common/constants';
import {sectionContentStyles} from '../../common/styles/content-section-styles-polymer';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {getStore} from '../../utils/redux-store-access';
import {isJsonStrMatch} from '../../utils/utils';

import {RootState} from '../../common/types/store.types';
import {selectReviewData, selectReviewDataPermissions} from './managementDocument.selectors';
import {ReviewDataPermission, ReviewData} from './managementDocument.model';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {isEmpty, cloneDeep} from 'lodash-es';
import {buttonsStyles} from '../../common/styles/button-styles';
import {patchIntervention} from '../../common/actions/interventions';
import {formatDate} from '../../utils/date-utils';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, MinimalUser, Permission, User} from '@unicef-polymer/etools-types';
import {MinimalAgreement} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {getDifference} from '../../common/mixins/objects-diff';

/**
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin UploadsMixin
 */
@customElement('review-and-sign')
export class InterventionReviewAndSign extends CommentsMixin(ComponentBaseMixin(UploadMixin(LitElement))) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    if (!this.data || !this.permissions) {
      return html` <style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      <style>
        ${sectionContentStyles}${sharedStyles}:host {
          display: flex;
          flex-direction: column;
          width: 100%;
          display: block;
          margin-bottom: 24px;
        }

        
        
        paper-input-container{
          margin-left: 0px;
        }
        paper-input {
          width: 100%;
        }
        paper-checkbox {
          display: flex;
          flex-direction: row;
          align-items: center;
          min-height: 24px;
          margin-left: 0px;
        }
        paper-checkbox[disabled] {
          cursor: not-allowed;
          --paper-checkbox-unchecked-color: black;
          --paper-checkbox-label: {
            color: var(--primary-text-color);
            opacity: 1;
          }
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
      </style>
      <etools-content-panel
        show-expand-btn class="content-section"
        panel-title=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.SIGNATURES_DATES')}
        comment-element="signatures-and-dates"
        comment-description=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.SIGNATURES_DATES')}
      >
        <div slot="panel-btns">
          ${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-3">
            <!-- Document Submission Date -->
            <datepicker-lite
              id="submissionDateField"
              label=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.DOC_SUB_DATE')}
              .value="${this.data.submission_date}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.submission_date)}"
              selected-date-display-format="D MMM YYYY"
              ?required="${this.permissions.required.submission_date}"
              max-date="${this.getCurrentDate()}"
              fire-date-has-changed
              @date-has-changed="${(e: CustomEvent) =>
                this.valueChanged({value: formatDate(e.detail.date, 'YYYY-MM-DD')}, 'submission_date')}"
              max-date-error-msg=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.MAX_DATE_ERR')}
              error-message=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.DOC_DATE_REQUIRED')}
              ?auto-validate="${this.editMode}"
            >

          </div>
          <div class="col col-5 styled">
            <!-- Submitted to PRC? -->
            <paper-input-container>
              <div slot="input" class="paper-input-input">
                <paper-checkbox
                  ?checked="${this.data.submitted_to_prc}"
                  ?disabled="${this._isSubmittedToPrcCheckReadonly(
                    this.permissions.edit.prc_review_attachment,
                    this._lockSubmitToPrc
                  )}"
                  @checked-changed="${({detail}: CustomEvent) => this.updatePrc(detail)}"
                >
                  ${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.SUBMITTED_PRC')}
                </paper-checkbox>
              </div>
            </paper-input-container>
          </div>
        </div>
        ${
          this.data.submitted_to_prc
            ? html`<div class="layout-horizontal row-padding-v row-second-bg">
                <div class="col col-3">
                  <!-- Submission Date to PRC -->
                  <datepicker-lite
                    id="submissionDatePrcField"
                    label=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.SUBMISSION_DATE_PRC')}
                    .value="${this.data.submission_date_prc}"
                    ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.submission_date_prc)}"
                    ?required="${this.data.prc_review_attachment}"
                    fire-date-has-changed
                    @date-has-changed="${(e: CustomEvent) =>
                      this.valueChanged({value: formatDate(e.detail.date, 'YYYY-MM-DD')}, 'submission_date_prc')}"
                    selected-date-display-format="D MMM YYYY"
                    auto-validate
                  >
                  </datepicker-lite>
                </div>
                <div class="col col-3">
                  <!-- Review Date by PRC -->
                  <datepicker-lite
                    id="reviewDatePrcField"
                    label=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.REVIEW_DATE_PRC')}
                    .value="${this.data.review_date_prc}"
                    ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.review_date_prc)}"
                    ?required="${this.data.prc_review_attachment}"
                    fire-date-has-changed
                    @date-has-changed="${(e: CustomEvent) =>
                      this.valueChanged({value: formatDate(e.detail.date, 'YYYY-MM-DD')}, 'review_date_prc')}"
                    selected-date-display-format="D MMM YYYY"
                    auto-validate
                  >
                  </datepicker-lite>
                </div>
                <div class="col col-6">
                  <!-- PRC Review Document -->
                  <etools-upload
                    id="reviewDocUpload"
                    label=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.PRC_REVIEW_DOC')}
                    accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.txt"
                    .fileUrl="${this.data.prc_review_attachment}"
                    .uploadEndpoint="${this.uploadEndpoint}"
                    @upload-finished="${this._prcRevDocUploadFinished}"
                    ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.prc_review_attachment)}"
                    .showDeleteBtn="${this.showPrcReviewDeleteBtn(this.data.status)}"
                    @delete-file="${this._prcRevDocDelete}"
                    @upload-started="${this._onUploadStarted}"
                    @change-unsaved-file="${this._onChangeUnsavedFile}"
                  >
                  </etools-upload>
                </div>
              </div>`
            : html``
        }
        <div class="layout-horizontal row-padding-v">
          <div class="col col-6 layout-vertical">
            <!-- Signed By Partner Authorized Officer -->
            <etools-dropdown
              id="signedByAuthorizedOfficer"
              label=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.SIGNED_PARTNER_AUTH_OFFICER')}
              placeholder="&#8212;"
              .options="${this.agreementAuthorizedOfficers}"
              .selected="${this.data.partner_authorized_officer_signatory?.id}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.partner_authorized_officer_signatory)}"
              ?required="${this.permissions.required.partner_authorized_officer_signatory}"
              auto-validate
              option-value="id"
              option-label="name"
              error-message=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.PARTNER_AUTH_OFFICER_ERR')}
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
                ? html`<label for="partnerAuth" class="paper-label">
                      ${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.SIGNED_PARTNER_AUTH_OFFICER')}
                    </label>
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
          <div class="col col-3">
            <!-- Signed by Partner Date -->
            <datepicker-lite
              id="signedByPartnerDateField"
              label=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.SIGNED_PARTNER_DATE')}
              .value="${this.data.signed_by_partner_date}"
              ?required="${this.permissions.required.signed_by_partner_date}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.signed_by_partner_date)}"
              fire-date-has-changed
              @date-has-changed="${(e: CustomEvent) =>
                this.valueChanged({value: formatDate(e.detail.date, 'YYYY-MM-DD')}, 'signed_by_partner_date')}"
              ?auto-validate="${this.editMode}"
              error-message=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.DATE_REQUIRED')}
              max-date-error-msg=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.MAX_DATE_ERR')}
              max-date="${this.getCurrentDate()}"
              selected-date-display-format="D MMM YYYY"
            >
            </datepicker-lite>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-6">
            <!-- Signed by UNICEF Authorized Officer -->
            <paper-input-container>
              <div slot="input" class="paper-input-input">
                <span class="input-value"> ${translate(
                  'INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.SIGNED_UNICEF_AUTH_OFFICER'
                )}</span>
              </div>
            </paper-input-container>
          </div>
          <div class="col col-3">
            <!-- Signed by UNICEF Date -->
            <datepicker-lite
              id="signedByUnicefDateField"
              label=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.SIGNED_UNICEF_DATE')}
              .value="${this.data.signed_by_unicef_date}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.signed_by_unicef_date)}"
              ?required="${this.permissions.required.signed_by_unicef_date}"
              fire-date-has-changed
              @date-has-changed="${(e: CustomEvent) =>
                this.valueChanged({value: formatDate(e.detail.date, 'YYYY-MM-DD')}, 'signed_by_unicef_date')}"
              ?auto-validate="${this.editMode}"
              error-message=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.DATE_REQUIRED')}
              max-date-error-msg=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.MAX_DATE_ERR')}
              max-date="${this.getCurrentDate()}"
              selected-date-display-format="D MMM YYYY"
            >
            </datepicker-lite>
          </div>
        </div>
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-6 layout-vertical">
            <!-- Signed by UNICEF -->
            <etools-dropdown
              id="signedByUnicef"
              label=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.SIGNED_UNICEF')}
              placeholder="&#8212;"
              .options="${this.signedByUnicefUsers}"
              option-value="id"
              option-label="name"
              .selected="${this.data.unicef_signatory?.id}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.unicef_signatory)}"
              auto-validate
              error-message=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.UNICEF_USER_ERR')}
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
                ? html`<label for="unicefSignatory" class="paper-label"
                      >${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.SIGNED_UNICEF')}</label
                    >
                    <div id="unicefSignatory">
                      ${this.renderReadonlyUserDetails(
                        this.originalData?.unicef_signatory ? [this.originalData?.unicef_signatory] : []
                      )}
                    </div>`
                : html``
            }
          </div>
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-6">
            <!-- Signed PD/SPD -->
            <etools-upload
              id="signedIntervFile"
              label=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.SIGNED_PD_SPD')}
              accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.txt"
              .fileUrl="${this.data.signed_pd_attachment}"
              .uploadEndpoint="${this.uploadEndpoint}"
              @upload-finished="${this._signedPDUploadFinished}"
              .showDeleteBtn="${this.showSignedPDDeleteBtn(this.data.status)}"
              @delete-file="${this._signedPDDocDelete}"
              ?auto-validate="${this.editMode}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.signed_pd_attachment)}"
              ?required="${this.permissions.required.signed_pd_attachment}"
              error-message=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.SELECT_SIGNED_PD_SPD_DOC')}
              @upload-started="${this._onUploadStarted}"
              @change-unsaved-file="${this._onChangeUnsavedFile}"
            >
            </etools-upload>
          </div>
          ${
            this._showDaysToSignedFields(this.data.status)
              ? html`<div class="col col-3">
                    <paper-input
                      label=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.DAYS_SUBMISSION_SIGNED')}
                      .value="${this.data.days_from_submission_to_signed}"
                      placeholder="&#8212;"
                      readonly
                      tabindex="-1"
                    >
                    </paper-input>
                  </div>
                  <div class="col col-3">
                    <paper-input
                      label=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.DAYS_REVIEW_SIGNED')}
                      .value="${this.data.days_from_review_to_signed}"
                      placeholder="&#8212;"
                      readonly
                      tabindex="-1"
                    >
                    </paper-input>
                  </div>`
              : html``
          }
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-6">
            <!-- TERMINATION DOC -->
            <etools-upload
              id="terminationDoc"
              label=${translate('INTERVENTION_MANAGEMENT.REVIEW_AND_SIGN.TERMINATION_NOTICE')}
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

  @property({type: Boolean})
  _lockSubmitToPrc = false;

  @property({type: String})
  partnerDateValidatorErrorMessage!: string;

  @property({type: String})
  unicefDateValidatorErrorMessage!: string;

  @property({type: String})
  uploadEndpoint: string = getEndpoint(interventionEndpoints.attachmentsUpload).url;

  @property({type: Boolean})
  isUnicefUser = false;

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'management')) {
      return;
    }

    if (!isJsonStrMatch(this.signedByUnicefUsers, state.commonData!.unicefUsersData)) {
      this.signedByUnicefUsers = cloneDeep(state.commonData!.unicefUsersData);
    }
    if (state.user && state.user.data) {
      this.isUnicefUser = state.user.data.is_unicef_user;
    }

    if (state.interventions.current) {
      this.data = selectReviewData(state);
      this.originalData = cloneDeep(this.data);
      const permissions = selectReviewDataPermissions(state);
      if (!isJsonStrMatch(this.permissions, permissions)) {
        this.permissions = permissions;
        this.set_canEditAtLeastOneField(this.permissions.edit);
      }
      if (this.data.submitted_to_prc) {
        this._lockSubmitToPrc = true;
      } else {
        this._lockSubmitToPrc = false;
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
      super.stateChanged(state);

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

  _resetPrcFieldsValidations() {
    (this.shadowRoot!.querySelector('#submissionDatePrcField')! as DatePickerLite).invalid = false;
    (this.shadowRoot!.querySelector('#reviewDatePrcField')! as DatePickerLite).invalid = false;
  }

  _isDraft(status: string) {
    return status === CONSTANTS.STATUSES.Draft.toLowerCase() || status === '';
  }

  _hideDeleteBtn(status: string, fileUrl: string) {
    return this._isDraft(status) && fileUrl;
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
    if (this.data.prc_review_attachment) {
      const dateFields = ['#submissionDatePrcField', '#reviewDatePrcField'];
      fieldSelectors.push(...dateFields);
    }
    fieldSelectors.forEach((selector: string) => {
      const field = this.shadowRoot!.querySelector(selector) as LitElement & {validate(): boolean};
      if (field && !field.validate()) {
        valid = false;
      }
    });
    return valid;
  }

  /**
   * intervention.submitted_to_prc is set only on bk if submission_date_prc, review_date_prc are filled in
   * For the submitted_to_prc field to be true when file is attached also,
   * we make the date fields required
   */
  _showSubmittedToPrcFields(submittedToPrc: boolean) {
    return submittedToPrc;
  }

  _showDaysToSignedFields(status: string) {
    return !this._isDraft(status);
  }

  _isSubmittedToPrcCheckReadonly(isPrcDocEditable: boolean, lockSubmitToPrc: boolean) {
    if (this.editMode) {
      return !isPrcDocEditable || lockSubmitToPrc;
    }
    // if not in edit mode it is always disabled
    return true;
  }

  _interventionDocTypeChanged(interventionDocumentType: string) {
    if (typeof interventionDocumentType === 'undefined') {
      return;
    }

    const submittedToPrc = this._showSubmittedToPrcFields(this.data.submitted_to_prc);
    if (!submittedToPrc) {
      this.data.submitted_to_prc = false;
      this._resetPrcFields();
    }
  }

  _resetPrcFields() {
    this.data.submission_date_prc = '';
    this.data.review_date_prc = '';
    this.data.prc_review_attachment = null;
  }

  _signedPDUploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const response = e.detail.success;
      this.data.signed_pd_attachment = response.id;
      this.requestUpdate();
    }
  }

  _signedPDDocDelete(_e: CustomEvent) {
    this.data.signed_pd_attachment = null;
  }

  _prcRevDocUploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const response = e.detail.success;
      this.data.prc_review_attachment = response.id;
    }
  }

  _prcRevDocDelete(_e: CustomEvent) {
    this.data.prc_review_attachment = null;
    this._resetPrcFieldsValidations();
  }

  showPrcReviewDeleteBtn(status: string) {
    return this._isDraft(status) && !!this.originalData && !this.originalData.prc_review_attachment;
  }

  showSignedPDDeleteBtn(status: string) {
    return this._isDraft(status) && !!this.originalData && !this.originalData.signed_pd_attachment;
  }

  getCurrentDate() {
    return new Date();
  }

  updatePrc(detail: any) {
    this.data = {...this.data, submitted_to_prc: detail.value} as ReviewData;
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
        this.editMode = false;
      });
  }

  private formatUserData(data: ReviewData) {
    const dataToSave: any = cloneDeep(data);
    dataToSave.unicef_signatory = data.unicef_signatory?.id;
    // eslint-disable-next-line max-len
    dataToSave.partner_authorized_officer_signatory = data.partner_authorized_officer_signatory?.id;
    return dataToSave;
  }
}
