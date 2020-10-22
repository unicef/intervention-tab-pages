import {LitElement, html, customElement, property} from 'lit-element';
import {getStore} from '../../utils/redux-store-access';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {Permission} from '../../common/models/intervention.types';
import {RootState} from '../../common/models/globals.types';
import {TechnicalDetails, TechnicalDetailsPermissions} from './technicalGuidance.models';
import {selectTechnicalDetails, selectTechnicalDetailsPermissions} from './technicalGuidance.selectors';
import {patchIntervention} from '../../common/actions';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-loading/etools-loading';
import cloneDeep from 'lodash-es/cloneDeep';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction} from '../../common/types/types';

/**
 * @customElement
 */
@customElement('technical-guidance')
export class TechnicalGuidance extends CommentsMixin(ComponentBaseMixin(LitElement)) {
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

      <etools-content-panel
        show-expand-btn
        panel-title="Technical Guidance, Capacity Development, Miscellaneous"
        comment-element="technical-guidance"
        comment-description="Technical Guidance, Capacity Development, Miscellaneous"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row-padding-v">
          <paper-textarea
            id="technicalGuidance"
            label="Technical Guidance"
            always-float-label
            placeholder="—"
            .value="${this.data.technical_guidance}"
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
            .value="${this.data.capacity_development}"
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
            .value="${this.data.other_partners_involved}"
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
            .value="${this.data.other_info}"
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
  data!: TechnicalDetails;

  @property({type: Object})
  permissions!: Permission<TechnicalDetailsPermissions>;

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'details')) {
      return;
    }

    if (!state.interventions.current) {
      return;
    }
    this.data = selectTechnicalDetails(state);
    this.originalData = cloneDeep(this.data);
    this.permissions = selectTechnicalDetailsPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
    super.stateChanged(state);
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }
    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.data))
      .then(() => {
        this.editMode = false;
      });
  }
}
