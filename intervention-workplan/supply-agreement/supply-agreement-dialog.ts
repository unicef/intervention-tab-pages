import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {validateRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {formatServerErrorAsText} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {updateCurrentIntervention} from '../../common/actions/interventions';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import {EtoolsEndpoint, ExpectedResult} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';

/**
 * @customElement
 */
@customElement('supply-agreement-dialog')
export class SupplyAgreementDialog extends ComponentBaseMixin(LitElement) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <etools-dialog
        id="supplyAgreementDialog"
        size="md"
        ?hide-confirm-btn="${!this.confirmBtnTxt}"
        ?show-spinner="${this.requestInProcess}"
        dialog-title="${this.dialogTitle}"
        ok-btn-text="${this.confirmBtnTxt}"
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        keep-dialog-open
        ?disable-confirm-btn="${this.requestInProcess}"
        @confirm-btn-clicked="${this.onSaveClick}"
        @close="${() => this.onClose()}"
      >
        <div class="row">
          <div class="col col-12">
            <etools-input
              class="w100"
              value="${this.data.title}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'title')}"
              label=${translate(translatesMap.title)}
              type="text"
              placeholder="—"
              error-message=${translate('GENERAL.REQUIRED_FIELD')}
              auto-validate
              required
            ></etools-input>
          </div>
          <div class="col col-md-4 col-6">
            <etools-input
              value="${this.data.unit_number ? this.data.unit_number : ''}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'unit_number')}"
              label=${translate(translatesMap.unit_number)}
              maxlength="16"
              allowed-pattern="[0-9]"
              placeholder="—"
              error-message=${translate('GENERAL.REQUIRED_FIELD')}
              required
              auto-validate
            >
            </etools-input>
          </div>
          <div class="col col-md-4 col-6">
            <etools-currency
              id="unicefCash"
              label=${translate(translatesMap.unit_price)}
              placeholder="—"
              required
              .value="${this.data.unit_price ? this.data.unit_price : ''}"
              @focus="${() => (this.autoValidate = true)}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'unit_price')}"
              .autoValidate="${this.autoValidate}"
              .currency="${this.currency}"
            >
            </etools-currency>
          </div>
          <div class="col col-md-4 col-12">
            <etools-dropdown
              label=${translate(translatesMap.provided_by)}
              placeholder="&#8212;"
              .options="${this.providers}"
              option-label="label"
              option-value="id"
              .selected="${this.data.provided_by}"
              required
              hide-search
              auto-validate
              trigger-value-change-event
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                this.selectedItemChanged(detail, 'provided_by');
              }}"
            >
            </etools-dropdown>
          </div>
          ${this.isUnicefUser
            ? html` <div class="col col-md-8 col-12">
                <etools-dropdown
                  class="cp-out"
                  label=${translate(translatesMap.result)}
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
              </div>`
            : html``}

          <div class="col col-md-4 col-12" ?hidden="${this.data.provided_by == 'partner'}">
            <etools-input
              id="unicefProductNumber"
              label=${translate(translatesMap.unicef_product_number)}
              placeholder="—"
              .value="${this.data.unicef_product_number ? this.data.unicef_product_number : ''}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'unicef_product_number')}"
            >
            </etools-input>
          </div>
          <div class="col col-12">
            <etools-textarea
              id="otherMentions"
              label=${translate(translatesMap.other_mentions)}
              always-float-label
              placeholder="—"
              .value="${this.data.other_mentions}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'other_mentions')}"
            ></etools-textarea>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Boolean})
  requestInProcess = false;

  @property({type: Boolean})
  isNewRecord = true;

  @property({type: String})
  dialogTitle = '';

  @property({type: String})
  currency = '';

  @property({type: String})
  confirmBtnTxt = '';

  @property({type: Number})
  interventionId!: number;

  @property({type: Object})
  cpOutputs: ExpectedResult[] = [];

  @property({type: Boolean})
  isUnicefUser = false;

  @property({type: Boolean})
  autoValidate = false;

  @property({type: Array})
  providers = [
    {label: getTranslation('UNICEF'), id: 'unicef'},
    {label: getTranslation('PARTNER'), id: 'partner'}
  ];

  set dialogData({data, interventionId, result_links, isUnicefUser, currency}: any) {
    this.cpOutputs = (result_links || []).filter((x: ExpectedResult) => !!x.cp_output_name);
    this.data = data;
    this.currency = currency;
    this.isNewRecord = !this.data.id;
    if (this.isNewRecord) {
      this.data.provided_by = 'unicef';
    }
    this.interventionId = interventionId;
    this.dialogTitle = this.isNewRecord
      ? (translate('ADD_SUPPLY_CONTRIBUTION') as unknown as string)
      : (translate('EDIT_SUPPLY_CONTRIBUTION') as unknown as string);
    this.confirmBtnTxt = this.isNewRecord
      ? (translate('GENERAL.ADD') as unknown as string)
      : (translate('GENERAL.SAVE') as unknown as string);
    this.isUnicefUser = isUnicefUser;
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
      ? getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.supplyAgreementAdd, {
          interventionId: this.interventionId
        })
      : getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.supplyAgreementEdit, {
          interventionId: this.interventionId,
          supplyId: this.data.id
        });

    sendRequest({
      endpoint: endpoint,
      method: this.isNewRecord ? 'POST' : 'PATCH',
      body: this.cleanUpData(this.data)
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

  cleanUpData(data: any) {
    const dataToSave = cloneDeep(data);
    if (dataToSave.provided_by == 'partner') {
      dataToSave.unicef_product_number = '';
    }
    return dataToSave;
  }
}
