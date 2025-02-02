import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {PartnerReportingRequirements, RootState} from '../../common/types/store.types';
import {ProgrammeDocDates, InterventionDatesPermissions} from './interventionDates.models';
import cloneDeep from 'lodash-es/cloneDeep';
import {selectInterventionDates, selectInterventionDatesPermissions} from './interventionDates.selectors';

import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {patchIntervention} from '../../common/actions/interventions';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import get from 'lodash-es/get';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-upload';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, EtoolsEndpoint, FrsDetails, Intervention, Permission} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import ReportingRequirementsCommonMixin from '../reporting-requirements/mixins/reporting-requirements-common-mixin';
import {translatesMap} from '../../utils/intervention-labels-map';
import UploadsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/uploads-mixin';
import FrNumbersConsistencyMixin from '@unicef-polymer/etools-modules-common/dist/mixins/fr-numbers-consistency-mixin';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {frWarningsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/fr-warnings-styles';
import pick from 'lodash-es/pick';
import {RequestEndpoint} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';

/**
 * @customElement
 */
@customElement('intervention-dates')
export class InterventionDates extends CommentsMixin(
  UploadsMixin(ComponentBaseMixin(FrNumbersConsistencyMixin(ReportingRequirementsCommonMixin(LitElement))))
) {
  static get styles() {
    return [layoutStyles, frWarningsStyles];
  }

  render() {
    if (!this.data || !this.permissions) {
      return html` ${sharedStyles}
        <etools-loading source="dates" active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
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
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>
        <div class="row">
          <div class="col-md-3 col-12">
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
                label=${translate(translatesMap.start)}
                .value="${this.data.start}"
                ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.start)}"
                ?required="${this.permissions?.required.start}"
                error-message=${translate('SELECT_START_DATE')}
                auto-validate
                selected-date-display-format="D MMM YYYY"
                fire-date-has-changed
                @date-has-changed="${({detail}: CustomEvent) => this.dateHasChanged(detail, 'start')}"
              >
              </datepicker-lite>
              <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
              <span slot="message">${this._frsStartConsistencyWarning}</span>
            </etools-info-tooltip>
          </div>

          <!-- End date -->
          <div class="col-md-3 col-12">
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
                label=${translate(translatesMap.end)}
                .value="${this.data.end}"
                ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.end)}"
                ?required="${this.permissions?.required.end}"
                error-message=${translate('SELECT_END_DATE')}
                auto-validate
                selected-date-display-format="D MMM YYYY"
                fire-date-has-changed
                @date-has-changed="${({detail}: CustomEvent) => this.dateHasChanged(detail, 'end')}"
              >
              </datepicker-lite>
              <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
              <span slot="message">${this._frsEndConsistencyWarning}</span>
            </etools-info-tooltip>
          </div>
        </div>
        <div class="row" ?hidden="${this.hideActivationLetter(this.data.status, this.data.contingency_pd)}">
          <div class="col-12">
            <etools-upload
              label=${translate('ACTIVATION_LETTER')}
              id="activationLetterUpload"
              .fileUrl="${this.data.activation_letter_attachment}"
              .uploadEndpoint="${this.uploadEndpoint}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.activation_letter_attachment)}"
              @upload-finished="${(e: CustomEvent) => this.activationLetterUploadFinished(e)}"
              @upload-started="${this._onUploadStarted}"
              @change-unsaved-file="${this._onChangeUnsavedFile}"
              .showDeleteBtn="${this.showActivationLetterDeleteBtn(
                this.data.status,
                this.permissions?.edit.activation_letter_attachment,
                this.editMode
              )}"
            >
            </etools-upload>
          </div>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: String})
  uploadEndpoint: string = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.attachmentsUpload).url;

  @property({type: Object})
  originalData!: ProgrammeDocDates;

  @property({type: Object})
  data!: ProgrammeDocDates;

  @property({type: String})
  _frsStartConsistencyWarning: string | boolean = '';

  @property({type: String})
  _frsEndConsistencyWarning: string | boolean = '';

  @property({type: Object})
  permissions!: Permission<InterventionDatesPermissions>;

  warningRequired = false;

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'timing')) {
      return;
    }
    if (!state.interventions.current) {
      return;
    }
    this.data = selectInterventionDates(state);
    this.checkIfWarningRequired(state);
    this.originalData = cloneDeep(this.data);
    this.permissions = selectInterventionDatesPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);

    this.checkIntervDateConsistency(this.data, state.interventions.current.frs_details);
    super.stateChanged(state);
  }

  checkIntervDateConsistency(data: ProgrammeDocDates, frs_details: FrsDetails) {
    this._frsStartConsistencyWarning = this.checkFrsAndIntervDateConsistency(
      data.start,
      frs_details.earliest_start_date,
      getTranslation(translatesMap.start),
      true
    );
    this._frsEndConsistencyWarning = this.checkFrsAndIntervDateConsistency(
      data.end,
      frs_details.latest_end_date,
      getTranslation(translatesMap.end),
      true
    );
  }

  private hideActivationLetter(interventionStatus: string, isContingencyPd: boolean) {
    if (!isContingencyPd) {
      return true;
    }
    return ['draft', 'development', ''].includes(interventionStatus);
  }

  private activationLetterUploadFinished(e: CustomEvent) {
    this._onUploadFinished(e.detail.success);
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

  private checkIfWarningRequired(state: RootState) {
    // Existence of PD Output activities with timeframes are validated on BK
    this.warningRequired =
      this.thereArePartnerReportingRequirements(state.interventions.partnerReportingRequirements) ||
      this.thereAreProgrammaticVisits(state.interventions.current);
  }

  private thereArePartnerReportingRequirements(partnerReportingRequirements: PartnerReportingRequirements) {
    if (partnerReportingRequirements) {
      return Object.entries(partnerReportingRequirements).some(([_key, value]) => !!value.length);
    }
    return false;
  }

  private thereAreProgrammaticVisits(intervention: Intervention | null) {
    return !!intervention?.planned_visits && intervention.planned_visits.length > 0;
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }

    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.cleanUpData(this.data)))
      .then(() => {
        if (this.warningRequired) {
          fireEvent(this, 'toast', {
            text: getTranslation('SAVE_WARNING')
          });
        }
        this._onUploadSaved();
        this.editMode = false;
      });
  }

  private cleanUpData(data: any) {
    const cleanedData = pick(data, ['activation_letter_attachment', 'end', 'start']);
    if (isNaN(cleanedData.activation_letter_attachment)) {
      delete cleanedData.activation_letter_attachment;
    }
    return cleanedData;
  }
}
