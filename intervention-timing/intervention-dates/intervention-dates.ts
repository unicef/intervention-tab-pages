import {LitElement, html, customElement, property} from 'lit-element';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import FrNumbersConsistencyMixin from '../../common/mixins/fr-numbers-consistency-mixin';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {PartnerReportingRequirements, RootState} from '../../common/types/store.types';
import {ProgrammeDocDates, InterventionDatesPermissions} from './interventionDates.models';
import cloneDeep from 'lodash-es/cloneDeep';
import {selectInterventionDates, selectInterventionDatesPermissions} from './interventionDates.selectors';
import {buttonsStyles} from '../../common/styles/button-styles';
import {getStore} from '../../utils/redux-store-access';
import {patchIntervention} from '../../common/actions/interventions';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import '@unicef-polymer/etools-upload/etools-upload';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, Permission} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';
import {fireEvent} from '../../utils/fire-custom-event';
import ReportingRequirementsCommonMixin from '../reporting-requirements/mixins/reporting-requirements-common-mixin';

/**
 * @customElement
 */
@customElement('intervention-dates')
export class InterventionDates extends CommentsMixin(
  ComponentBaseMixin(FrNumbersConsistencyMixin(ReportingRequirementsCommonMixin(LitElement)))
) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    if (!this.data || !this.permissions) {
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
        datepicker-lite {
          min-width: 200px;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('PROGRAMME_DOC_DATES')}
        comment-element="programme-document-dates"
        comment-description=${translate('PROGRAMME_DOC_DATES')}
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>
        <div class="layout-horizontal row-padding-v">
          <div class="col col-3">
            <!-- Start date -->
            <etools-info-tooltip
              class="fr-nr-warn"
              icon-first
              custom-icon
              form-field-align
              ?hide-tooltip="${!this.frsConsistencyWarningIsActive(this._frsStartConsistencyWarning)}"
            >
              <datepicker-lite
                slot="field"
                id="intStart"
                label=${translate('START_DATE')}
                .value="${this.data.start}"
                ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.start)}"
                ?required="${this.permissions.required.start}"
                error-message=${translate('SELECT_START_DATE')}
                auto-validate
                selected-date-display-format="D MMM YYYY"
                fire-date-has-changed
                @date-has-changed="${({detail}: CustomEvent) => this.dateHasChanged(detail, 'start')}"
              >
              </datepicker-lite>
              <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
              <span slot="message">${this._frsStartConsistencyWarning}</span>
            </etools-info-tooltip>
          </div>

          <!-- End date -->
          <div class="col col-3">
            <etools-info-tooltip
              class="fr-nr-warn"
              custom-icon
              icon-first
              form-field-align
              ?hide-tooltip="${!this.frsConsistencyWarningIsActive(this._frsEndConsistencyWarning)}"
            >
              <datepicker-lite
                slot="field"
                id="intEnd"
                label=${translate('END_DATE')}
                .value="${this.data.end}"
                ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.end)}"
                ?required="${this.permissions.required.end}"
                error-message=${translate('SELECT_END_DATE')}
                auto-validate
                selected-date-display-format="D MMM YYYY"
                fire-date-has-changed
                @date-has-changed="${({detail}: CustomEvent) => this.dateHasChanged(detail, 'end')}"
              >
              </datepicker-lite>
              <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
              <span slot="message">${this._frsEndConsistencyWarning}</span>
            </etools-info-tooltip>
          </div>
        </div>
        <div
          class="layout-horizontal row-padding-v"
          ?hidden="${this.hideActivationLetter(this.data.status, this.data.contingency_pd)}"
        >
          <etools-upload
            label=${translate('ACTIVATION_LETTER')}
            id="activationLetterUpload"
            .fileUrl="${this.data.activation_letter_attachment}"
            .uploadEndpoint="${this.uploadEndpoint}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.activation_letter_attachment)}"
            @upload-finished="${(e: CustomEvent) => this.activationLetterUploadFinished(e)}"
            .showDeleteBtn="${this.showActivationLetterDeleteBtn(
              this.data.status,
              this.permissions.edit.activation_letter_attachment,
              this.editMode
            )}"
          >
          </etools-upload>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }
  @property({type: String})
  uploadEndpoint = interventionEndpoints.attachmentsUpload.url!;

  @property({type: Object})
  originalData!: ProgrammeDocDates;

  @property({type: Object})
  data!: ProgrammeDocDates;

  @property({type: String})
  _frsStartConsistencyWarning = '';

  @property({type: String})
  _frsEndConsistencyWarning = '';

  @property({type: Object})
  permissions!: Permission<InterventionDatesPermissions>;

  warningRequired = false;

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'timing')) {
      return;
    }
    if (!state.interventions.current) {
      return;
    }
    this.data = selectInterventionDates(state);
    this.checkIfWarningRequired(state.interventions.partnerReportingRequirements);
    this.originalData = cloneDeep(this.data);
    this.permissions = selectInterventionDatesPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
    super.stateChanged(state);
  }

  private hideActivationLetter(interventionStatus: string, isContingencyPd: boolean) {
    if (!isContingencyPd) {
      return true;
    }
    return ['draft', 'development', ''].includes(interventionStatus);
  }

  private activationLetterUploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const response = e.detail.success;
      this.data.activation_letter_attachment = response.id;
      this.requestUpdate();
    }
  }

  private showActivationLetterDeleteBtn(interventionStatus: string, permission: boolean, editMode: boolean) {
    return (
      !this.isReadonly(editMode, permission) &&
      ['draft', 'development', ''].includes(interventionStatus) &&
      permission &&
      !this.originalData.activation_letter_attachment
    );
  }

  private checkIfWarningRequired(partnerReportingRequirements: PartnerReportingRequirements) {
    // Existence of PD Output activities with timeframes are validated on BK
    this.warningRequired = this.thereArePartnerReportingRequirements(partnerReportingRequirements);
  }

  private thereArePartnerReportingRequirements(partnerReportingRequirements: PartnerReportingRequirements) {
    if (partnerReportingRequirements) {
      return Object.entries(partnerReportingRequirements).some(([_key, value]) => !!value.length);
    }
    return false;
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }

    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.data))
      .then(() => {
        if (this.warningRequired) {
          fireEvent(this, 'toast', {
            text: getTranslation('SAVE_WARNING'),
            showCloseBtn: true
          });
        }
        this.editMode = false;
      });
  }
}
