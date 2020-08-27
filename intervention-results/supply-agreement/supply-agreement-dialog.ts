import {LitElement, html, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {getStore} from '../../utils/redux-store-access';
import {connect} from 'pwa-helpers/connect-mixin';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {validateRequiredFields} from '../../utils/validation-helper';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '../../utils/fire-custom-event';
import {AnyObject} from '../../common/models/globals.types';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {ExpectedResult} from '../../common/models/intervention.types';

/**
 * @customElement
 */
@customElement('supply-agreement-dialog')
export class SupplyAgreementDialog extends connect(getStore())(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    // language=HTML
    return html`
      <style>
        ${sharedStyles}
      </style>

      <etools-dialog
        id="supplyAgreementDialog"
        size="md"
        ?opened="${this.dialogOpened}"
        ?hide-confirm-btn="${!this.confirmBtnTxt}"
        ?show-spinner="${this.requestInProcess}"
        dialog-title="${this.dialogTitle}"
        ok-btn-text="${this.confirmBtnTxt}"
        keep-dialog-open
        ?disable-confirm-btn="${this.requestInProcess}"
        @confirm-btn-clicked="${this.onSaveClick}"
        @close="${() => this.onClose()}"
      >

      <div class="layout-horizontal">
        <div class="col col-12">
          <paper-input
           class="w100"
            value="${this.data.title}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'title')}"
            label="Title"
            type="text"
            placeholder="Enter title"
            required
          >
        </div>
      </div>
      <div class="layout-horizontal">
        <div class="col col-4">
          </paper-input>
          <paper-input
            value="${this.data.unit_number ? this.data.unit_number : ''}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'unit_number')}"
            label="Number of units"
            allowed-pattern="[0-9]"
            placeholder="Enter number of units"
            required
          >
          </paper-input>
        </div>
        <div class="col col-4">
          <paper-input
            value="${this.data.unit_price ? this.data.unit_price : ''}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'unit_price')}"
            label="Price / Unit"
            allowed-pattern="[0-9]"
            placeholder="Enter price / unit"
            required
          >
          </paper-input>
        </div>
      </div>

      <div class="layout-horizontal">
        <div class="col col-8">
          <etools-dropdown
            class="cp-out"
            label="CP Output"
            placeholder="&#8212;"
            .options="${this.cpOutputs}"
            option-label="cp_output_name"
            option-value="cp_output"
            .selected="${this.data.result}"
            trigger-value-change-event
            @etools-selected-item-changed="${({detail}: CustomEvent) => {
              this.selectedItemChanged(detail, 'result', 'cp_output');
            }}"
          >
          </etools-dropdown>
        </div>
      </div>
      </etools-dialog>
    `;
  }

  @property() protected dialogOpened = true;

  @property({type: Boolean})
  requestInProcess = false;

  @property({type: Boolean})
  isNewRecord = true;

  @property({type: String})
  dialogTitle = '';

  @property({type: String})
  confirmBtnTxt = '';

  @property({type: Number})
  interventionId!: number;

  @property({type: Object})
  callbackFunction!: any;

  @property({type: Object})
  cpOutputs: ExpectedResult[] = [];

  set dialogData({data, interventionId, result_links, callbackFunction}: any) {
    this.cpOutputs = result_links || [];
    this.data = data;
    this.isNewRecord = !this.data.id;
    this.interventionId = interventionId;
    // TODO callbackFunction it's used temporarily just to test list page updates
    // will be removed when saving will work (see comments below)
    this.callbackFunction = callbackFunction;
    this.dialogTitle = this.isNewRecord ? 'Add  Supply Agreement' : 'Edit Supply Agreement';
    this.confirmBtnTxt = this.isNewRecord ? 'Add' : 'Save';
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  validate() {
    return validateRequiredFields(this);
  }

  onSaveClick() {
    if (!this.validate()) {
      return;
    }

    const endpoint = this.isNewRecord
      ? getEndpoint(interventionEndpoints.supplyAgreementAdd, {interventionId: this.interventionId})
      : getEndpoint(interventionEndpoints.supplyAgreementEdit, {
          interventionId: this.interventionId,
          supplyId: this.data.id
        });

    sendRequest({
      endpoint: endpoint,
      method: this.isNewRecord ? 'POST' : 'PATCH',
      body: this.data
    })
      .then((_response: any) => {
        // TODO as response we will get intervention updates with supply and
        // will need to dispatch here to update current intervention
        if (this.callbackFunction) {
          this.callbackFunction();
        }
        this.onClose();
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
      });
  }
}
