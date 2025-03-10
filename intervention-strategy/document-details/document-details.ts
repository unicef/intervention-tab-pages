import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {selectDocumentDetails, selectDocumentDetailsPermissions} from './documentDetails.selectors';
import {DocumentDetailsPermissions, DocumentDetails} from './documentDetails.models';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {patchIntervention} from '../../common/actions/interventions';
import cloneDeep from 'lodash-es/cloneDeep';
import {RootState} from '../../common/types/store.types';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, Permission} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/info-icon-tooltip';
import {detailsTextareaRowsCount} from '../../utils/utils';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';

/**
 * @customElement
 */
@customElement('document-details')
export class DocumentDetailsElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    if (!this.data || !this.permissions) {
      return html` ${sharedStyles}
        <etools-loading source="doc-det" active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }

        info-icon-tooltip {
          --iit-icon-size: 18px;
          --iit-margin: 0 0 4px 4px;
        }
        .padding-v {
          padding-block-start: 2px;
          padding-block-end: 2px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('DOCUMENT_DETAILS')}
        comment-element="document-details"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row">
          <div class="col-12">
            <etools-textarea
              id="title"
              label=${translate('TITLE')}
              always-float-label
              placeholder="—"
              .autoValidate="${this.autoValidate}"
              .value="${this.data.title}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'title')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit?.title)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit?.title) ? -1 : undefined}"
              ?required="${this.permissions?.required.title}"
              @focus="${() => (this.autoValidate = true)}"
              error-message="This field is required"
              maxlength="256"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions?.edit?.title)}"
            >
            </etools-textarea>
          </div>

          <div class="col-12">
            <etools-textarea
              id="context"
              no-label-float
              type="text"
              label="${translate(translatesMap.context)}"
              placeholder="—"
              .value="${this.data.context}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'context')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit?.context)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit?.context) ? -1 : undefined}"
              ?required="${this.permissions?.required.context}"
              maxlength="7000"
              rows="${detailsTextareaRowsCount(this.editMode)}"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions?.edit?.context)}"
              .infoIconMessage="${translate('CONTEXT_TOOLTIP')}"
            >
            </etools-textarea>
          </div>

          <div class="col-12">
            <div>
              <label class="label">${translate(translatesMap.implementation_strategy)}</label>
              <info-icon-tooltip
                id="iit-implemen-strat"
                slot="after-label"
                ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit?.implementation_strategy)}"
                .tooltipText="${translate('IMPLEMENTATION_STRATEGY_AND_TECHNICAL_GUIDANCE_TOOLTIP')}"
              ></info-icon-tooltip>
            </div>
            <etools-textarea
              id="implementation-strategy"
              no-label-float
              placeholder="—"
              .value="${this.data.implementation_strategy}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'implementation_strategy')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit?.implementation_strategy)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit?.implementation_strategy)
                ? -1
                : undefined}"
              ?required="${this.permissions?.required.implementation_strategy}"
              maxlength="5000"
              rows="${detailsTextareaRowsCount(this.editMode)}"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions?.edit?.implementation_strategy)}"
            >
            </etools-textarea>
          </div>

          <div class="col-12">
            <div>
              <label class="label">${translate(translatesMap.capacity_development)}</label>
              <info-icon-tooltip
                id="iit-cap-develop"
                slot="after-label"
                ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit.capacity_development)}"
                .tooltipText="${translate('CAPACITY_DEVELOPMENT_TOOLTIP')}"
              ></info-icon-tooltip>
            </div>

            <etools-textarea
              id="capacityDevelopment"
              type="text"
              no-label-float
              placeholder="—"
              .value="${this.data.capacity_development}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.capacity_development)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit?.capacity_development)
                ? -1
                : undefined}"
              ?required="${this.permissions?.required.capacity_development}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'capacity_development')}"
              maxlength="5000"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions?.edit?.capacity_development)}"
              rows="${detailsTextareaRowsCount(this.editMode)}"
            >
            </etools-textarea>
          </div>

          <div class="col-12">
            <div>
              <label class="label">${translate(translatesMap.other_partners_involved)}</label>
              <info-icon-tooltip
                id="iit-other-p-i"
                ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit.other_partners_involved)}"
                .tooltipText="${translate('OTHER_PARTNERS_INVOLVED_TOOLTIP')}"
              ></info-icon-tooltip>
            </div>
            <etools-textarea
              no-label-float
              id="otherPartnersInvolved"
              type="text"
              always-float-label
              placeholder="—"
              .value="${this.data.other_partners_involved}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.other_partners_involved)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.other_partners_involved)
                ? -1
                : undefined}"
              ?required="${this.permissions?.required.other_partners_involved}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'other_partners_involved')}"
              maxlength="5000"
              rows="${detailsTextareaRowsCount(this.editMode)}"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions?.edit?.other_partners_involved)}"
            >
            </etools-textarea>
          </div>

          <div class="col-12">
            <div>
              <label class="label">${translate(translatesMap.other_details)}</label>
            </div>
            <etools-textarea
              no-label-float
              id="otherDetails"
              type="text"
              always-float-label
              placeholder="—"
              .value="${this.data.other_details}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.other_details)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.other_details) ? -1 : undefined}"
              ?required="${this.permissions?.required.other_details}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'other_details')}"
              maxlength="5000"
              rows="${detailsTextareaRowsCount(this.editMode)}"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions?.edit?.other_details)}"
            >
            </etools-textarea>
          </div>

          <div class="col-12 padding-v">
            <etools-checkbox
              ?checked="${this.data.has_data_processing_agreement}"
              ?disabled="${this.isReadonly(this.editMode, this.permissions.edit.has_data_processing_agreement)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions.edit.has_data_processing_agreement)
                ? -1
                : undefined}"
              @sl-change=${(e: any) => this.valueChanged({value: e.target.checked}, 'has_data_processing_agreement')}
            >
              ${translate(translatesMap.has_data_processing_agreement)}
            </etools-checkbox>
          </div>

          <div class="col-12 padding-v" ?hidden="${!this.data.has_activities_involving_children}">
            <etools-checkbox
              ?checked="${this.data.has_activities_involving_children}"
              ?disabled="${this.isReadonly(this.editMode, this.permissions.edit.has_activities_involving_children)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions.edit.has_activities_involving_children)
                ? -1
                : undefined}"
              @sl-change=${(e: any) =>
                this.valueChanged({value: e.target.checked}, 'has_activities_involving_children')}
            >
              ${translate(translatesMap.has_activities_involving_children)}
            </etools-checkbox>
          </div>

          <div class="col-12 padding-v">
            <etools-checkbox
              ?checked="${this.data.has_special_conditions_for_construction}"
              ?disabled="${this.isReadonly(
                this.editMode,
                this.permissions.edit.has_special_conditions_for_construction
              )}"
              tabindex="${this.isReadonly(this.editMode, this.permissions.edit.has_special_conditions_for_construction)
                ? -1
                : undefined}"
              @sl-change=${(e: any) =>
                this.valueChanged({value: e.target.checked}, 'has_special_conditions_for_construction')}
            >
              ${translate(translatesMap.has_special_conditions_for_construction)}
            </etools-checkbox>
          </div>
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
  canEditDocumentDetails!: boolean;

  @property({type: Boolean})
  autoValidate = false;

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'strategy')) {
      return;
    }

    if (!state.interventions.current) {
      return;
    }
    this.data = selectDocumentDetails(state);
    this.originalData = cloneDeep(this.data);
    this.setPermissions(state);
    super.stateChanged(state);
  }

  private setPermissions(state: any) {
    this.permissions = selectDocumentDetailsPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
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
