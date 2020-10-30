import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown';
import '@polymer/paper-input/paper-textarea';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {getStore} from '../../utils/redux-store-access';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {buttonsStyles} from '../../common/styles/button-styles';
import {validateRequiredFields} from '../../utils/validation-helper';
import {getEndpoint} from '../../utils/endpoint-helper';
import {fireEvent} from '../../utils/fire-custom-event';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {updateCurrentIntervention} from '../../common/actions/interventions';
import {LabelAndValue} from '@unicef-polymer/etools-types';
import {Intervention} from '@unicef-polymer/etools-types';

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
      <style>
        ${sharedStyles} paper-textarea {
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
        ?opened="${this.dialogOpened}"
        ok-btn-text="Save"
        dialog-title="${this.riskDialogTitle}"
        ?show-spinner="${this.savingInProcess}"
        @close="${() => this.onClose()}"
        @confirm-btn-clicked="${() => this._validateAndSaveRisk()}"
      >
        <div class="row-padding layout-horizontal">
          <div class="col col-4">
            <etools-dropdown
              id="type"
              label="Type"
              .options="${this.riskTypes}"
              .selected="${this.originalData.risk_type}"
              option-value="value"
              option-label="label"
              required
              @etools-selected-item-changed="${({detail}: CustomEvent) =>
                this.selectedItemChanged(detail, 'risk_type', 'value')}"
              trigger-value-change-event
            >
            </etools-dropdown>
          </div>
          <div class="col col-8">
            <paper-textarea
              id="mitigationMeasures"
              label="Proposed Mitigation Measures"
              always-float-label
              type="text"
              placeholder="—"
              required
              error-message="This field is required"
              .value="${this.originalData.mitigation_measures}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'mitigation_measures')}"
            >
            </paper-textarea>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Array}) riskTypes!: LabelAndValue[];

  @property({type: Boolean}) dialogOpened = true;

  @property({type: Boolean}) savingInProcess = false;

  @property() riskDialogTitle = '';

  private endpoint!: EtoolsRequestEndpoint;

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {item, interventionId, permissions, riskTypes} = data;
    this.originalData = item;
    this.endpoint = getEndpoint(interventionEndpoints.intervention, {interventionId});
    this.permissions = permissions;
    this.riskTypes = riskTypes;
    this.riskDialogTitle = item.id ? 'Edit risk' : 'Add risk';
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
