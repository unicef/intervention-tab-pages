import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-currency-amount-input';
import {gridLayoutStylesLit} from '../../../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../../../common/styles/button-styles';
import ComponentBaseMixin from '../../../../common/mixins/component-base-mixin';
import {sharedStyles} from '../../../../common/styles/shared-styles-lit';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '../../../../common/utils/endpoint-helper';
import {interventionEndpoints} from '../../../../common/utils/intervention-endpoints';
import {fireEvent} from '../../../../common/utils/fire-custom-event';
import {getStore} from '../../../../common/utils/redux-store-access';
import {updateCurrentIntervention} from '../../common/actions/interventions';
import {translate, get as getTranslation} from 'lit-translate';
import {translatesMap} from '../../../../common/utils/intervention-labels-map';

/**
 * @customElement
 */
@customElement('activity-dialog')
export class ActivityDialog extends ComponentBaseMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    // language=HTML
    return html`
      <style>
        ${sharedStyles} *[hidden] {
          display: none !important;
        }
        .layout-horizontal {
          overflow: hidden;
        }

        etools-dialog::part(ed-scrollable) {
          margin-top: 0 !important;
        }
      </style>

      <etools-dialog
        id="activityDialog"
        size="md"
        keep-dialog-open
        dialog-title=${translate('EDIT_ACTIVITY')}
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        ?opened="${this.dialogOpened}"
        ?show-spinner="${this.loadingInProcess}"
        @close="${() => this.onClose()}"
        @confirm-btn-clicked="${this.onSaveClick}"
      >
        <div class="row-padding-v">
          <paper-input
            readonly
            tabindex="-1"
            id="title"
            label=${translate('GENERAL.TITLE')}
            always-float-label
            placeholder="—"
            .value="${this.originalData.title}"
          >
          </paper-input>
        </div>

        <div class="row-padding-v">
          <paper-textarea
            id="description"
            label=${translate('GENERAL.DESCRIPTION')}
            readonly
            tabindex="-1"
            always-float-label
            placeholder="—"
            .value="${this.originalData.description}"
          ></paper-textarea>
        </div>

        <div class="layout-horizontal">
          <div class="col col-6">
            <etools-currency-amount-input
              id="partnerContribution"
              label=${translate('PARTNER_CASH')}
              .value="${this.originalData.partner_contribution}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, this.getPropertyName('partner'))}"
            >
            </etools-currency-amount-input>
          </div>
          <div class="col col-6">
            <etools-currency-amount-input
              id="unicefCash"
              label=${translate(translatesMap.unicef_cash)}
              .value="${this.originalData.unicef_cash}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, this.getPropertyName('unicef'))}"
            >
            </etools-currency-amount-input>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {activity, interventionId}: any = data;
    this.originalData = activity;
    this.interventionId = interventionId;
  }

  private interventionId = '';

  @property() loadingInProcess = false;

  @property() dialogOpened = true;

  onSaveClick() {
    this.loadingInProcess = true;

    sendRequest({
      endpoint: getEndpoint(interventionEndpoints.interventionBudgetUpdate, {
        interventionId: this.interventionId
      }),
      method: 'PATCH',
      body: this.data
    })
      .then(({intervention}) => {
        getStore().dispatch(updateCurrentIntervention(intervention));
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch(() => {
        this.loadingInProcess = false;
        fireEvent(this, 'toast', {text: getTranslation('GENERAL.ERR_OCCURRED')});
      });
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  getPropertyName(sufix: string) {
    return this.originalData ? `act${this.originalData.index}_${sufix}` : '';
  }
}
