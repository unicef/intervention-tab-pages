import {LitElement, html, customElement, property} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {selectDocumentDetails, selectDocumentDetailsPermissions} from './documentDetails.selectors';
import {Permission} from '../../common/models/intervention.types';
import {DocumentDetailsPermissions, DocumentDetails} from './documentDetails.models';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {getStore} from '../../utils/redux-store-access';
import {connect} from 'pwa-helpers/connect-mixin';
import {validateRequiredFields} from '../../utils/validation-helper';
import {isJsonStrMatch} from '../../utils/utils';
import {patchIntervention} from '../../common/actions';
import cloneDeep from 'lodash-es/cloneDeep';

/**
 * @customElement
 */
@customElement('document-details')
export class PartnerDetailsElement extends connect(getStore())(ComponentBaseMixin(LitElement)) {
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
      </style>

      <etools-content-panel show-expand-btn panel-title="Document Details">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>

        <div slot="panel-btns">
          ${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}
        </div>

        <div class="row-padding-v">
          <paper-input
            id="title"
            label="Title"
            always-float-label
            placeholder="—"
            .value="${this.data.title}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'title')}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.title)}"
            ?required="${this.permissions.required.title}"
          >
          </paper-input>
        </div>

        <div class="row-padding-v">
          <paper-textarea
            id="context"
            label="Context"
            always-float-label
            type="text"
            placeholder="—"
            .value="${this.data.context}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'context')}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.context)}"
            ?required="${this.permissions.required.context}"
          >
          </paper-textarea>
        </div>

        <div class="row-padding-v">
          <paper-textarea
            id="implementation-strategy"
            label="Implementation Strategy"
            always-float-label
            placeholder="—"
            .value="${this.data.implementation_strategy}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'implementation_strategy')}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.implementation_strategy)}"
            ?required="${this.permissions.required.implementation_strategy}"
          >
          </paper-textarea>
        </div>

        <div class="row-padding-v">
          <paper-textarea
            id="ip_program_contribution"
            label="Partner non-financial contribution"
            always-float-label
            placeholder="—"
            .value="${this.data.ip_program_contribution}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'ip_program_contribution')}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.ip_program_contribution)}"
            ?required="${this.permissions.required.ip_program_contribution}"
          >
          </paper-textarea>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }
  @property({type: Object})
  data!: DocumentDetails;

  @property({type: Object})
  permissions!: Permission<DocumentDetailsPermissions>;

  @property({type: Object})
  originalData = {};

  @property({type: Boolean})
  showLoading = false;

  @property({type: Boolean})
  canEditDocumentDetails!: boolean;

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: any) {
    if (!state.interventions.current) {
      return;
    }
    this.data = selectDocumentDetails(state);
    this.originalData = cloneDeep(this.data);
    this.sePermissions(state);
  }

  private sePermissions(state: any) {
    const newPermissions = selectDocumentDetailsPermissions(state);
    if (!isJsonStrMatch(this.permissions, newPermissions)) {
      this.permissions = newPermissions;
      this.set_canEditAtLeastOneField(this.permissions.edit);
    }
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
