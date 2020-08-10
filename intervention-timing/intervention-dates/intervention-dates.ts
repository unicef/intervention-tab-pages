import {LitElement, html, customElement, property} from 'lit-element';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import FrNumbersConsistencyMixin from '../../common/mixins/fr-numbers-consistency-mixin';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {Intervention, Permission} from '../../common/models/intervention.types';
import {ProgrammeDocDates, InterventionDatesPermissions} from './interventionDates.models';
import cloneDeep from 'lodash-es/cloneDeep';
import {selectInterventionDates, selectInterventionDatesPermissions} from './interventionDates.selectors';
import {validateRequiredFields} from '../../utils/validation-helper';
import {buttonsStyles} from '../../common/styles/button-styles';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {patchIntervention} from '../../common/actions';

/**
 * @customElement
 */
@customElement('intervention-dates')
export class InterventionDates extends connect(getStore())(ComponentBaseMixin(FrNumbersConsistencyMixin(LitElement))) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
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
        datepicker-lite {
          min-width: 200px;
        }
      </style>

      <etools-content-panel show-expand-btn panel-title="Programme Document Dates">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>

        <div slot="panel-btns">
          ${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}
        </div>
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
                label="Start date"
                .value="${this.data.start}"
                ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.start)}"
                ?required="${this.permissions.required.start}"
                error-message="Please select start date"
                auto-validate
                selected-date-display-format="D MMM YYYY"
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
                label="End date"
                .value="${this.data.end}"
                ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.end)}"
                ?required="${this.permissions.required.end}"
                error-message="Please select end date"
                auto-validate
                selected-date-display-format="D MMM YYYY"
              >
              </datepicker-lite>
              <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
              <span slot="message">${this._frsEndConsistencyWarning}</span>
            </etools-info-tooltip>
          </div>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Boolean})
  showLoading = false;

  @property({type: Object})
  intervention!: Intervention;

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

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: any) {
    if (!state.interventions.current) {
      return;
    }
    this.data = selectInterventionDates(state);
    this.originalData = cloneDeep(this.data);
    this.permissions = selectInterventionDatesPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
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
