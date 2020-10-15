import {customElement, LitElement, html, property} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-checkbox';

import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-upload/etools-upload';

import '@unicef-polymer/etools-date-time/datepicker-lite';
import DatePickerLite from '@unicef-polymer/etools-date-time/datepicker-lite';

import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import MissingDropdownOptionsMixin from '../../common/mixins/missing-dropdown-options-mixin';
import UploadMixin from '../../common/mixins/uploads-mixin';
import CONSTANTS from '../../common/constants';
import {sectionContentStylesPolymer} from '../../common/styles/content-section-styles-polymer';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {getStore} from '../../utils/redux-store-access';
import {isJsonStrMatch} from '../../utils/utils';

import {Permission} from '../../common/models/intervention.types';
import {MinimalUser, RootState} from '../../common/models/globals.types';
import {selectReviewData, selectReviewDataPermissions} from './managementDocument.selectors';
import {ReviewDataPermission, ReviewData} from './managementDocument.model';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {isEmpty, cloneDeep} from 'lodash-es';
import {MinimalAgreement} from '../../common/models/agreement.types';
import {buttonsStyles} from '../../common/styles/button-styles';
import {patchIntervention} from '../../common/actions';
import {formatDate} from '../../utils/date-utils';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';

/**
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin MissingDropdownOptionsMixin
 * @appliesMixin UploadsMixin
 */
@customElement('review-and-sign')
export class InterventionReviewAndSign extends CommentsMixin(
  ComponentBaseMixin(MissingDropdownOptionsMixin(UploadMixin(LitElement)))
) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    if (!this.data) {
      return html` <style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      <style>
        ${sectionContentStylesPolymer}${sharedStyles}:host {
          @apply --layout-vertical;
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
          @apply --layout-horizontal;
          @apply --layout-center;
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
      </style>
      <etools-content-panel
        show-expand-btn class="content-section"
        panel-title="Signatures & Dates"
        comment-element="signatures-and-dates"
        comment-description="Signatures & Dates"
      >
        <div slot="panel-btns">
          ${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-3">
            <!-- Document Submission Date -->
            <datepicker-lite
              id="submissionDateField"
              label="Document Submission Date"
              .value="${this.data.submission_date}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.submission_date)}"
              selected-date-display-format="D MMM YYYY"
              ?required="${this.permissions.required.submission_date}"
              max-date="${this.getCurrentDate()}"
              fire-date-has-changed
              @date-has-changed="${(e: CustomEvent) =>
                this.valueChanged({value: formatDate(e.detail.date, 'YYYY-MM-DD')}, 'submission_date')}"
              max-date-error-msg="Date can not be in the future"
              error-message="Document Submission Date is required"
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
                  Submitted to PRC?
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
                    label="Submission Date to PRC"
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
                    label="Review Date by PRC"
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
                    label="PRC Review Document"
                    accept=".doc,.docx,.pdf,.jpg,.png"
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
          <div class="col col-6">
            <!-- Signed By Partner Authorized Officer -->
            <etools-dropdown
              id="signedByAuthorizedOfficer"
              label="Signed by Partner Authorized Officer"
              placeholder="&#8212;"
              .options="${this.getCleanEsmmOptions(this.agreementAuthorizedOfficers)}"
              .selected="${this.data.partner_authorized_officer_signatory}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.partner_authorized_officer_signatory)}"
              ?required="${this.permissions.required.partner_authorized_officer_signatory}"
              auto-validate
              error-message="Please select Partner Authorized Officer"
              @etools-selected-item-changed="${({detail}: CustomEvent) =>
                this.selectedItemChanged(detail, 'partner_authorized_officer_signatory', 'value')}"
              trigger-value-change-event
            >
            </etools-dropdown>
          </div>
          <div class="col col-3">
            <!-- Signed by Partner Date -->
            <datepicker-lite
              id="signedByPartnerDateField"
              label="Signed by Partner Date"
              .value="${this.data.signed_by_partner_date}"
              ?required="${this.permissions.required.signed_by_partner_date}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.signed_by_partner_date)}"
              fire-date-has-changed
              @date-has-changed="${(e: CustomEvent) =>
                this.valueChanged({value: formatDate(e.detail.date, 'YYYY-MM-DD')}, 'signed_by_partner_date')}"
              ?auto-validate="${this.editMode}"
              error-message="Date is required"
              max-date-error-msg="Date can not be in the future"
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
                <span class="input-value"> Signed by UNICEF Authorized Officer</span>
              </div>
            </paper-input-container>
          </div>
          <div class="col col-3">
            <!-- Signed by UNICEF Date -->
            <datepicker-lite
              id="signedByUnicefDateField"
              label="Signed by UNICEF Date"
              .value="${this.data.signed_by_unicef_date}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.signed_by_unicef_date)}"
              ?required="${this.permissions.required.signed_by_unicef_date}"
              fire-date-has-changed
              @date-has-changed="${(e: CustomEvent) =>
                this.valueChanged({value: formatDate(e.detail.date, 'YYYY-MM-DD')}, 'signed_by_unicef_date')}"
              ?auto-validate="${this.editMode}"
              error-message="Date is required"
              max-date-error-msg="Date can not be in the future"
              max-date="${this.getCurrentDate()}"
              selected-date-display-format="D MMM YYYY"
            >
            </datepicker-lite>
          </div>
        </div>
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-6">
            <!-- Signed by UNICEF -->
            <etools-dropdown
              id="signedByUnicef"
              label="Signed by UNICEF"
              placeholder="&#8212;"
              .options="${this.getCleanEsmmOptions(this.signedByUnicefUsers)}"
              option-value="id"
              option-label="name"
              .selected="${this.data.unicef_signatory}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.unicef_signatory)}"
              auto-validate
              error-message="Please select UNICEF user"
              @etools-selected-item-changed="${({detail}: CustomEvent) =>
                this.selectedItemChanged(detail, 'unicef_signatory')}"
              trigger-value-change-event
            >
            </etools-dropdown>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-6">
            <!-- Signed PD/SPD -->
            <etools-upload
              id="signedIntervFile"
              label="Signed PD/SPD"
              accept=".doc,.docx,.pdf,.jpg,.png"
              .fileUrl="${this.data.signed_pd_attachment}"
              .uploadEndpoint="${this.uploadEndpoint}"
              @upload-finished="${this._signedPDUploadFinished}"
              .showDeleteBtn="${this.showSignedPDDeleteBtn(this.data.status)}"
              @delete-file="${this._signedPDDocDelete}"
              ?auto-validate="${this.editMode}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.signed_pd_attachment)}"
              ?required="${this.permissions.required.signed_pd_attachment}"
              error-message="Please select Signed PD/SPD document"
              @upload-started="${this._onUploadStarted}"
              @change-unsaved-file="${this._onChangeUnsavedFile}"
            >
            </etools-upload>
          </div>
          ${
            this._showDaysToSignedFields(this.data.status)
              ? html`<div class="col col-3">
                    <paper-input
                      label="Days from Submission to Signed"
                      .value="${this.data.days_from_submission_to_signed}"
                      placeholder="&#8212;"
                      readonly
                    >
                    </paper-input>
                  </div>
                  <div class="col col-3">
                    <paper-input
                      label="Days from Review to Signed"
                      .value="${this.data.days_from_review_to_signed}"
                      placeholder="&#8212;"
                      readonly
                    >
                    </paper-input>
                  </div>`
              : html``
          }
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
  signedByUnicefUsers!: MinimalUser[];

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

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'management')) {
      return;
    }

    if (!isJsonStrMatch(this.signedByUnicefUsers, state.commonData!.unicefUsersData)) {
      this.signedByUnicefUsers = cloneDeep(state.commonData!.unicefUsersData);
    }
    // review it
    this.signedByUnicefUsers = cloneDeep(state.commonData!.unicefUsersData);

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
      }
      super.stateChanged(state);
    }
  }

  getAuthorizedOfficersList(agreementData: any) {
    if (!agreementData) {
      return null;
    }
    return agreementData.authorized_officers!.map((officer: any) => {
      return {
        value: typeof officer.id === 'string' ? parseInt(officer.id, 10) : officer.id,
        label: officer.first_name + ' ' + officer.last_name
      };
    });
  }

  filterAgreementsById(agreements: MinimalAgreement[], agreementId: string) {
    return agreements.filter((a: any) => String(a.id) === String(agreementId))[0];
  }

  connectedCallback() {
    super.connectedCallback();
    // @lajos: review this, not sure we will use it anymore
    this.setDropdownMissingOptionsAjaxDetails(this.shadowRoot?.querySelector('#signedByUnicef'), 'unicefUsers', {
      dropdown: true
    });
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
      .dispatch(patchIntervention(this.data))
      .then(() => {
        this.editMode = false;
      });
  }
}
