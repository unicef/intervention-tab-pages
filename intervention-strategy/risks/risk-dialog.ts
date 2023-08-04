import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {validateRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {updateCurrentIntervention} from '../../common/actions/interventions';
import {EtoolsEndpoint, LabelAndValue} from '@unicef-polymer/etools-types';
import {Intervention} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';

/**
 * @customElement
 */
@customElement('risk-dialog')
export class RiskDialog extends ComponentBaseMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        paper-textarea {
          flex: auto;
          --paper-input-container-input: {
            display: block;
          }
        }
      </style>

      <etools-dialog
        no-padding
        keep-dialog-open
        id="riskDialog"
        size="md"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        dialog-title="${this.riskDialogTitle}"
        ?show-spinner="${this.savingInProcess}"
        @close="${() => this.onClose()}"
        @confirm-btn-clicked="${() => this._validateAndSaveRisk()}"
      >
        <div class="row-padding layout-horizontal">
          <div class="col col-4">
            <etools-dropdown
              id="type"
              label=${translate(translatesMap.risk_type)}
              .options="${this.riskTypes}"
              .selected="${this.originalData.risk_type}"
              option-value="value"
              option-label="label"
              auto-validate
              required
              error-message=${translate('GENERAL.REQUIRED_FIELD')}
              @etools-selected-item-changed="${({detail}: CustomEvent) =>
                this.selectedItemChanged(detail, 'risk_type', 'value')}"
              trigger-value-change-event
            >
            </etools-dropdown>
          </div>
        </div>
        <div class="row-padding layout-horizontal">
          <div class="col col-12">
            <etools-textarea
              id="mitigationMeasures"
              class="w100"
              label=${translate(translatesMap.mitigation_measures)}
              always-float-label
              type="text"
              .autoValidate="${this.autoValidate}"
              placeholder="—"
              required
              maxlength="2500"
              char-counter
              error-message=${translate('GENERAL.REQUIRED_FIELD')}
              .value="${this.originalData.mitigation_measures}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'mitigation_measures')}"
            >
            </etools-textarea>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Array}) riskTypes!: LabelAndValue[];

  @property({type: Boolean}) savingInProcess = false;

  @property() riskDialogTitle = '';

  @property({type: Boolean}) autoValidate = false;

  private endpoint!: EtoolsRequestEndpoint;

  firstUpdated(_changedProperties: any) {
    super.firstUpdated(_changedProperties);
    this._handlePaperTextareaAutovalidateError();
  }

  /**
   * This will prevent a console error "Uncaught TypeError: Cannot read property 'textarea' of undefined"
   * The error occurs only on first load/ hard refresh and on paper-textareas that have auto-validate
   */
  _handlePaperTextareaAutovalidateError() {
    this.autoValidate = true;
  }

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {item, interventionId, permissions, riskTypes} = data;
    this.originalData = item;
    this.endpoint = getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(interventionEndpoints.intervention, {
      interventionId
    });
    this.permissions = permissions;
    this.riskTypes = riskTypes.map((o: any) => ({
      ...o,
      label: getTranslatedValue(o.label, 'RISK_TYPE')
    }));

    this.riskDialogTitle = item.id
      ? (translate('EDIT_RISK') as unknown as string)
      : (translate('ADD_RISK') as unknown as string);
  }

  protected onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  _validateAndSaveRisk() {
    if (!validateRequiredFields(this)) {
      return;
    }
    this._saveRisk();
  }

  _saveRisk() {
    this.savingInProcess = true;
    this.data.id = this.originalData.id;

    sendRequest({
      endpoint: this.endpoint,
      body: {risks: this.data},
      method: 'PATCH'
    })
      .catch((error: any) => {
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      })
      .then((intervention: Intervention) => {
        getStore().dispatch(updateCurrentIntervention(intervention));
        this.onClose();
      })
      .finally(() => {
        this.savingInProcess = false;
      });
  }
}
