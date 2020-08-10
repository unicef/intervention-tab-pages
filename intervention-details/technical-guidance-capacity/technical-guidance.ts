import {LitElement, html, customElement, property} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {Permission} from '../../common/models/intervention.types';
import {TechnicalDetails, TechnicalDetailsPermissions} from './technicalGuidance.models';
import {selectTechnicalDetails, selectTechnicalDetailsPermissions} from './technicalGuidance.selectors';
import {patchIntervention} from '../../common/actions';
import {validateRequiredFields} from '../../utils/validation-helper';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-loading/etools-loading';
import cloneDeep from 'lodash-es/cloneDeep';

/**
 * @customElement
 */
@customElement('technical-guidance')
export class TechnicalGuidance extends connect(getStore())(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    if (!this.originalData) {
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

      <etools-content-panel show-expand-btn panel-title="Technical Guidance, Capacity Development, Miscellaneous">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>

        <div slot="panel-btns">
          ${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}
        </div>

        <div class="row-padding-v">
          <paper-textarea
            id="technicalGuidance"
            label="Technical Guidance"
            always-float-label
            placeholder="—"
            .value="${this.originalData.technical_guidance}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.technical_guidance)}"
            ?required="${this.permissions.required.technical_guidance}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'technical_guidance')}"
          >
          </paper-textarea>
        </div>

        <div class="row-padding-v">
          <paper-textarea
            id="capacityDevelopment"
            label="Capacity Development"
            type="text"
            always-float-label
            placeholder="—"
            .value="${this.originalData.capacity_development}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.capacity_development)}"
            ?required="${this.permissions.required.capacity_development}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'capacity_development')}"
          >
          </paper-textarea>
        </div>

        <div class="row-padding-v">
          <paper-textarea
            id="otherPartnersInvolved"
            label="Other Partners Involved"
            type="text"
            always-float-label
            placeholder="—"
            .value="${this.originalData.other_partners_involved}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.other_partners_involved)}"
            ?required="${this.permissions.required.other_partners_involved}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'other_partners_involved')}"
          >
          </paper-textarea>
        </div>

        <div class="row-padding-v">
          <paper-textarea
            id="otherInformation"
            label="Other Information"
            type="text"
            always-float-label
            placeholder="—"
            .value="${this.originalData.other_info}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.other_info)}"
            ?required="${this.permissions.required.other_info}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'other_info')}"
          >
          </paper-textarea>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  originalData!: TechnicalDetails;

  @property({type: Object})
  permissions!: Permission<TechnicalDetailsPermissions>;

  @property({type: Boolean})
  showLoading = false;

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: any) {
    if (!state.interventions.current) {
      return;
    }
    this.originalData = selectTechnicalDetails(state);
    this.permissions = selectTechnicalDetailsPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
  }

  cancel() {
    this.originalData = cloneDeep(this.originalData);
    this.editMode = false;
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
