import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-currency-amount-input';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '../../utils/fire-custom-event';
import {getStore} from '../../utils/redux-store-access';
import {getIntervention} from '../../common/actions';

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

        etools-dialog {
          --etools-dialog-scrollable: {
            display: flex;
            min-height: 300px;
            font-size: 16px;
          }
        }
      </style>

      <etools-dialog
        id="activityDialog"
        size="md"
        keep-dialog-open
        dialog-title="Edit activity"
        ok-btn-text="Save"
        ?opened="${this.dialogOpened}"
        @close="${() => this.onClose()}"
        @confirm-btn-clicked="${this.onSaveClick}"
      >
        <etools-loading ?active="${this.loadingInProcess}" loading-text="Loading..."></etools-loading>
        <div class="row-padding-v">
          <paper-input readonly id="title" label="Title" always-float-label placeholder="—" .value="${this.data.title}">
          </paper-input>
        </div>

        <div class="row-padding-v">
          <paper-textarea
            id="description"
            label="Description"
            readonly
            always-float-label
            placeholder="—"
            .value="${this.data.description}"
          ></paper-textarea>
        </div>

        <div class="layout-horizontal">
          <div class="col col-6">
            <etools-currency-amount-input
              id="unicefCash"
              label="UNICEF cash"
              .value="${this.data.unicef_cash}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'unicef_cash')}"
            >
            </etools-currency-amount-input>
          </div>
          <div class="col col-6">
            <etools-currency-amount-input
              id="partnerContribution"
              label="Partner contribution"
              .value="${this.data.partner_contribution}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'partner_contribution')}"
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
    this.data = activity;
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
      .then(() =>
        getStore()
          .dispatch(getIntervention(String(this.interventionId)))
          .catch(() => Promise.resolve())
      )
      .then(() => {
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch(() => {
        this.loadingInProcess = false;
        fireEvent(this, 'toast', {text: 'An error occurred. Try again.'});
      });
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
