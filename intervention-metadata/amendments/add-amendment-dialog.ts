import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-input/paper-input';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import '@unicef-polymer/etools-upload/etools-upload';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-modules-common/dist/layout/etools-warn-message';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {AnyObject, InterventionAmendment, LabelAndValue} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';
import {AmendmentsKind} from './pd-amendments.models';
import {validateRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin.js';

/**
 * @customElement
 */
@customElement('add-amendment-dialog')
export class AddAmendmentDialog extends ComponentBaseMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    return html`${sharedStyles}
      <style>
        paper-input#other {
          width: 100%;
        }
        .row-h {
          padding-top: 0 !important;
          padding-bottom: 16px;
          overflow: hidden !important;
        }
      </style>

      <etools-dialog
        no-padding
        keep-dialog-open
        id="add-amendment"
        size="md"
        ?opened="${this.dialogOpened}"
        ok-btn-text="Save"
        dialog-title=${translate('ADD_AMENDMENT')}
        @close="${() => this.onClose()}"
        @confirm-btn-clicked="${() => this._validateAndSaveAmendment()}"
        ?show-spinner="${this.savingInProcess}"
      >
        ${this.renderKindDropdown()}
        <div class="row-h flex-c">
          <!-- Amendment Type -->
          <etools-dropdown-multi
            id="amendment-types"
            label="${translate('AMENDMENT_TYPES')}"
            placeholder="&#8212;"
            .options="${this.filteredAmendmentTypes}"
            .selectedValues="${this.data.types}"
            hide-search
            required
            option-label="label"
            option-value="value"
            error-message="${translate('TYPE_ERR')}"
            trigger-value-change-event
            @etools-selected-items-changed="${({detail}: CustomEvent) => {
              this.selectedItemsChanged(detail, 'types', 'value');
              this.onTypesChanged();
            }}"
          >
          </etools-dropdown-multi>
        </div>
        <div class="row-h flex-c" ?hidden="${!this.data.types || !this.data.types!.length}">
          <etools-warn-message-lit .messages="${this.warnMessages}"></etools-warn-message-lit>
        </div>
        </div>
        <div class="row-h" ?hidden="${!this.showOtherInput}">
          <paper-input
            id="other"
            placeholder="&#8212;"
            label="${translate('OTHER')}"
            invalid
            ?required="${this.showOtherInput}"
            auto-validate
            error-message="${translate('GENERAL.REQUIRED_FIELD')}"
            .value="${this.data.other_description}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'other_description')}"
          >
          </paper-input>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Boolean}) dialogOpened = true;

  @property({type: Boolean}) savingInProcess = false;

  @property({type: Object})
  intervention!: AnyObject;

  @property({type: Array})
  amendmentTypes!: LabelAndValue[];

  // @property({type: Array})
  // amendmentKinds: LabelAndValue[] = [
  //   {
  //     label: getTranslation(AmendmentsKindTranslateKeys[AmendmentsKind.normal]),
  //     value: AmendmentsKind.normal
  //   },
  //   {
  //     label: getTranslation(AmendmentsKindTranslateKeys[AmendmentsKind.contingency]),
  //     value: AmendmentsKind.contingency
  //   }
  // ];

  @property({type: Array})
  filteredAmendmentTypes!: LabelAndValue[];

  @property({type: Boolean})
  showOtherInput = false;

  @property({type: Array})
  warnMessages: string[] = [];

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {intervention, amendmentTypes} = data;
    this.intervention = intervention;
    this.amendmentTypes = amendmentTypes;
    this._filterAmendmentTypes(this.amendmentTypes, this.intervention.document_type);
  }

  _filterAmendmentTypes(amendmentTypes: AnyObject[], interventionDocumentType: string) {
    if (!amendmentTypes || !interventionDocumentType) {
      return;
    }

    this.filteredAmendmentTypes = JSON.parse(JSON.stringify(this.amendmentTypes));
  }

  onTypesChanged() {
    this.showOtherInput = this.data.types ? this.data.types.indexOf('other') > -1 : false;
    this.warnMessages = this._getSelectedAmendmentTypeWarning(this.data.types);
  }

  _getSelectedAmendmentTypeWarning(types: string[] | undefined) {
    if (!types || !types.length) {
      return [];
    }
    const messages: string[] = [];
    types.forEach((amdType: string) => {
      switch (amdType) {
        case 'admin_error':
          messages.push(getTranslation('ADMIN_ERR_MSG'));
          break;
        case 'budget_lte_20':
          messages.push(getTranslation('BUDGET_LTE_20_MSG'));
          break;
        case 'budget_gt_20':
          messages.push(getTranslation('BUDGET_GT_20_MSG'));
          break;
        case 'no_cost':
          messages.push(getTranslation('NO_COST_EXTENSION_MSG'));
          break;
        case 'change':
          messages.push(getTranslation('CHANGE_MSG'));
          break;
        case 'other':
          messages.push(getTranslation('OTHER'));
          break;
      }
    });
    return messages;
  }

  _validateAndSaveAmendment() {
    if (!validateRequiredFields(this)) {
      return;
    }
    this._saveAmendment(this.data);
  }

  _saveAmendment(newAmendment: Partial<InterventionAmendment>) {
    const options = {
      method: 'POST',
      endpoint: getEndpoint(interventionEndpoints.interventionAmendmentAdd, {
        intervId: this.intervention.id
      }),
      body: {
        ...newAmendment,
        kind: AmendmentsKind.normal
      }
      // body: newAmendment
    };
    this.savingInProcess = true;
    sendRequest(options)
      .then((resp: InterventionAmendment) => {
        this._handleResponse(resp);
      })
      .catch((error: any) => {
        this._handleErrorResponse(error);
      })
      .finally(() => {
        this.savingInProcess = false;
      });
  }

  _handleResponse(_response: InterventionAmendment) {
    this.onClose({id: _response.amended_intervention});
  }

  _handleErrorResponse(error: any) {
    parseRequestErrorsAndShowAsToastMsgs(error, this);
  }

  public onClose(response = {}) {
    fireEvent(this, 'dialog-closed', {response});
  }

  public renderKindDropdown() {
    return '';
    // return html`
    //   <div class="row-h flex-c">
    //     <!-- Amendment kind -->
    //     <etools-dropdown
    //       id="amendment-kind"
    //       label=${translate('KIND')}
    //       placeholder="&#8212;"
    //       .options="${this.amendmentKinds}"
    //       .selectedValue="${this.data.kind}"
    //       hide-search
    //       required
    //       option-label="label"
    //       option-value="value"
    //       error-message=${translate('GENERAL.REQUIRED_FIELD')}
    //       trigger-value-change-event
    //       @etools-selected-item-changed="${({detail}: CustomEvent) => {
    //         this.selectedItemChanged(detail, 'kind', 'value');
    //       }}"
    //     >
    //     </etools-dropdown>
    //   </div>
    // `;
  }
}
