import {LitElement, html, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {getStore} from '../../utils/redux-store-access';
import {connect} from 'pwa-helpers/connect-mixin';
import {InterventionSupplyItem} from '../../common/models/intervention.types';
import {validateRequiredFields, resetRequiredFields} from '../../utils/validation-helper';

/**
 * @customElement
 */
@customElement('supply-agreement-dialog')
export class SupplyAgreementDialog extends connect(getStore())(LitElement) {
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
        @close="${() => this.closeDialog()}"
      >

      <div class="layout-horizontal">
        <div class="col col-12">
          <paper-input
           class="w100"
            value="${this.supplyItem.title}"
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
            value="${this.supplyItem.unit_number ? this.supplyItem.unit_number : ''}"
            label="Number of units"
            allowed-pattern="[0-9]"
            placeholder="Enter number of units"
            required
          >
          </paper-input>
        </div>
        <div class="col col-4">
          <paper-input
            value="${this.supplyItem.unit_price ? this.supplyItem.unit_price : ''}"
            label="Price / Unit"
            allowed-pattern="[0-9]"
            placeholder="Enter price / unit"
            required
          >
          </paper-input>
        </div>
      </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  supplyItem!: InterventionSupplyItem;

  @property({type: Boolean, reflect: true})
  dialogOpened = false;

  @property({type: Boolean})
  requestInProcess = false;

  @property({type: Boolean})
  isNewRecord = true;

  @property({type: String})
  dialogTitle = '';

  @property({type: String})
  confirmBtnTxt = '';

  stateChanged(_state: any) {
    // NOT sure we need this, will see..
  }

  connectedCallback() {
    super.connectedCallback();
  }

  public openDialog() {
    this.isNewRecord = !this.supplyItem.id;
    this.dialogTitle = this.isNewRecord ? 'Add  Supply Agreement' : 'Edit Supply Agreement';
    this.confirmBtnTxt = this.isNewRecord ? 'Add' : 'Save';
    resetRequiredFields(this);
    this.dialogOpened = true;
  }

  public closeDialog() {
    this.dialogOpened = false;
  }

  validate() {
    return validateRequiredFields(this);
  }

  onSaveClick() {
    if (this.validate()) {
      // TODO save
    }
  }
}
