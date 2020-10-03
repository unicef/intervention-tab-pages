import {LitElement, html, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {getStore} from '../../utils/redux-store-access';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {validateRequiredFields} from '../../utils/validation-helper';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '../../utils/fire-custom-event';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {ExpectedResult} from '../../common/models/intervention.types';
import {updateCurrentIntervention} from '../../common/actions';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-currency-amount-input';

/**
 * @customElement
 */
@customElement('supply-agreement-dialog')
export class SupplyAgreementDialog extends ComponentBaseMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    // language=HTML
    return html`
      <style>
        ${sharedStyles}
        paper-textarea {
          flex: auto;
          --paper-input-container-input: {
            display: block;
          }
        }
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
          <etools-currency-amount-input
            id="unicefCash"
            label="Price / Unit"
            placeholder="Enter price / unit"
            required
            .value="${this.data.unit_price ? this.data.unit_price : ''}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'unit_price')}"
          >
          </etools-currency-amount-input>
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
            option-value="id"
            .selected="${this.data.result}"

            trigger-value-change-event
            @etools-selected-item-changed="${({detail}: CustomEvent) => {
              this.selectedItemChanged(detail, 'result');
            }}"
          >
          </etools-dropdown>
        </div>
      </div>

      <div class="layout-horizontal">
        <div class="col col-12">
          <paper-textarea
            id="otherMentions"
            label="Other Mentions"
            always-float-label
            placeholder="—"
            .value="${this.data.other_mentions}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'other_mentions')}"
          ></paper-textarea>
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
  cpOutputs: ExpectedResult[] = [];

  set dialogData({data, interventionId, result_links}: any) {
    this.cpOutputs = result_links || [];
    this.data = data;
    this.isNewRecord = !this.data.id;
    this.interventionId = interventionId;
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
    // remove comma from formatted money values
    if (this.data.total_price) {
      this.data.total_price = this.data.total_price!.replace(/,/g, '');
    }
    if (!this.validate()) {
      return;
    }
    this.requestInProcess = true;
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
      .then((response: any) => {
        getStore().dispatch(updateCurrentIntervention(response.intervention));
        this.onClose();
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
      })
      .finally(() => {
        this.requestInProcess = false;
      });
  }
}
