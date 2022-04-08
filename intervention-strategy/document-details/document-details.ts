import {LitElement, html, customElement, property} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {selectDocumentDetails, selectDocumentDetailsPermissions} from './documentDetails.selectors';
import {DocumentDetailsPermissions, DocumentDetails} from './documentDetails.models';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {patchIntervention} from '../../common/actions/interventions';
import cloneDeep from 'lodash-es/cloneDeep';
import {RootState} from '../../common/types/store.types';
import {
  pageIsNotCurrentlyActive,
  detailsTextareaRowsCount
} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, Permission} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import '@unicef-polymer/etools-info-tooltip/info-icon-tooltip';
import '../../common/paper-textarea-with-icon';

/**
 * @customElement
 */
@customElement('document-details')
export class DocumentDetailsElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    if (!this.data || !this.permissions) {
      return html` ${sharedStyles}
        <etools-loading source="doc-det" loading-text="Loading..." active></etools-loading>`;
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
        paper-textarea-with-icon {
          outline: none;
          flex: auto;
        }

        info-icon-tooltip {
          --iit-icon-size: 18px;
          --iit-margin: 0 0 4px 4px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('DOCUMENT_DETAILS')}
        comment-element="document-details"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row-padding-v">
          <paper-textarea
            id="title"
            label=${translate('TITLE')}
            always-float-label
            placeholder="—"
            .autoValidate="${this.autoValidate}"
            .value="${this.data.title}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'title')}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit?.title)}"
            ?required="${this.permissions.required.title}"
            @focus="${() => (this.autoValidate = true)}"
            error-message="This field is required"
            maxlength="256"
            .charCounter="${!this.isReadonly(this.editMode, this.permissions.edit?.title)}"
          >
          </paper-textarea>
        </div>

        <div class="row-padding-v">
          <paper-textarea-with-icon
            id="context"
            label=${translate(translatesMap.context)}
            always-float-label
            type="text"
            placeholder="—"
            .value="${this.data.context}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'context')}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit?.context)}"
            ?required="${this.permissions.required.context}"
            maxlength="7000"
            rows="${detailsTextareaRowsCount(this.editMode)}"
            .charCounter="${!this.isReadonly(this.editMode, this.permissions.edit?.context)}"
          >
            <info-icon-tooltip
              id="iit-context"
              slot="after-label"
              ?hidden="${this.isReadonly(this.editMode, this.permissions.edit?.context)}"
              .tooltipText="${translate('CONTEXT_TOOLTIP')}"
            ></info-icon-tooltip>
          </paper-textarea-with-icon>
        </div>

        <div class="row-padding-v">
          <paper-textarea-with-icon
            id="implementation-strategy"
            label=${translate(translatesMap.implementation_strategy)}
            always-float-label
            placeholder="—"
            .value="${this.data.implementation_strategy}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'implementation_strategy')}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit?.implementation_strategy)}"
            ?required="${this.permissions.required.implementation_strategy}"
            maxlength="5000"
            rows="${detailsTextareaRowsCount(this.editMode)}"
            .charCounter="${!this.isReadonly(this.editMode, this.permissions.edit?.implementation_strategy)}"
          >
            <info-icon-tooltip
              id="iit-implemen-strat"
              slot="after-label"
              ?hidden="${this.isReadonly(this.editMode, this.permissions.edit?.implementation_strategy)}"
              .tooltipText="${translate('IMPLEMENTATION_STRATEGY_AND_TECHNICAL_GUIDANCE_TOOLTIP')}"
            ></info-icon-tooltip>
          </paper-textarea-with-icon>
        </div>

        <div class="row-padding-v">
          <paper-textarea-with-icon
            id="capacityDevelopment"
            label=${translate(translatesMap.capacity_development)}
            type="text"
            always-float-label
            placeholder="—"
            .value="${this.data.capacity_development}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.capacity_development)}"
            ?required="${this.permissions.required.capacity_development}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'capacity_development')}"
            maxlength="5000"
            rows="${detailsTextareaRowsCount(this.editMode)}"
          >
            <info-icon-tooltip
              id="iit-cap-develop"
              slot="after-label"
              ?hidden="${this.isReadonly(this.editMode, this.permissions.edit.capacity_development)}"
              .tooltipText="${translate('CAPACITY_DEVELOPMENT_TOOLTIP')}"
            ></info-icon-tooltip>
          </paper-textarea-with-icon>
        </div>

        <div class="layout-horizontal row-padding-v">
          <paper-textarea-with-icon
            id="otherPartnersInvolved"
            label=${translate(translatesMap.other_partners_involved)}
            type="text"
            always-float-label
            placeholder="—"
            .value="${this.data.other_partners_involved}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.other_partners_involved)}"
            ?required="${this.permissions.required.other_partners_involved}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'other_partners_involved')}"
            maxlength="5000"
            rows="${detailsTextareaRowsCount(this.editMode)}"
            .charCounter="${!this.isReadonly(this.editMode, this.permissions.edit?.other_partners_involved)}"
          >
            <info-icon-tooltip
              id="iit-other-p-i"
              slot="after-label"
              ?hidden="${this.isReadonly(this.editMode, this.permissions.edit.other_partners_involved)}"
              .tooltipText="${translate('OTHER_PARTNERS_INVOLVED_TOOLTIP')}"
            ></info-icon-tooltip>
          </paper-textarea-with-icon>
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
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'strategy')) {
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
