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
import {DocumentDetailsPermissions, DocumentDetails} from './documentDetails.models';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {getStore} from '../../utils/redux-store-access';
import {patchIntervention} from '../../common/actions/interventions';
import cloneDeep from 'lodash-es/cloneDeep';
import {RootState} from '../../common/types/store.types';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, Permission} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

/**
 * @customElement
 */
@customElement('document-details')
export class DocumentDetailsElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
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
        panel-title="Document Details"
        comment-element="document-details"
        comment-description="Document Details"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row-padding-v">
          <paper-textarea
            id="title"
            label=${translate('INTERVENTION_DETAILS.TITLE')}
            always-float-label
            placeholder="—"
            .autoValidate="${this.autoValidate}"
            .value="${this.data.title}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'title')}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.title)}"
            ?required="${this.permissions.required.title}"
            error-message="This field is required"
          >
          </paper-textarea>
        </div>

        <div class="row-padding-v">
          <paper-textarea
            id="context"
            label=${translate('INTERVENTION_DETAILS.CONTEXT')}
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
            label=${translate('INTERVENTION_DETAILS.IMPLEMENTATION_STRATEGY')}
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
            label=${translate('INTERVENTION_DETAILS.PARTNER_NON_FINANCIAL_CONTRIBUTION')}
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
  canEditDocumentDetails!: boolean;

  @property({type: Boolean})
  autoValidate = false;

  connectedCallback() {
    super.connectedCallback();
  }

  firstUpdated() {
    this._handlePaperTextareaAutovalidateError();
    super.firstUpdated();
  }

  /**
   * This will prevent a console error "Uncaught TypeError: Cannot read property 'textarea' of undefined"
   * The error occurs only on first load/ hard refresh and on paper-textareas that have auto-validate
   */
  _handlePaperTextareaAutovalidateError() {
    this.autoValidate = true;
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'details')) {
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
