import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-currency-amount-input';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {ProgrammeManagementActivityPermissions} from './effectiveEfficientProgrammeMgmt.models';
import {AnyObject} from '../../common/models/globals.types';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '../../utils/fire-custom-event';

/**
 * @customElement
 */
@customElement('activity-dialog')
export class ActivityDialog extends connect(getStore())(ComponentBaseMixin(LitElement)) {
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
        dialog-title="Edit activity"
        ?opened="${this.dialogOpened}"
        @close="${() => this.closeDialog()}"
        @confirm-btn-clicked="${() => this.onSaveClick()}"
      >
        <div class="row-padding-v">
          <paper-input
            readonly
            id="title"
            label="Title"
            always-float-label
            placeholder="—"
            .value="${this.activity.title}"
          >
          </paper-input>
        </div>

        <div class="row-padding-v">
          <paper-textarea
            id="description"
            label="Description"
            readonly
            always-float-label
            placeholder="—"
            .value="${this.activity.description}"
            ?readonly="${this.isReadonly(this.editMode, this._permissionObj.edit.programme_management_activity)}"
          ></paper-textarea>
        </div>

        <div class="layout-horizontal">
          <div class="col col-6">
            <etools-currency-amount-input id="unicefCash" label="UNICEF cash" .value="${this.activity.unicef_cash}">
            </etools-currency-amount-input>
          </div>
          <div class="col col-6">
            <etools-currency-amount-input
              id="partnerContribution"
              label="Partner contribution"
              .value="${this.activity.partner_contribution}"
              ?readonly="${this.isReadonly(this.editMode, this._permissionObj.edit.programme_management_activity)}"
            >
            </etools-currency-amount-input>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  private _permissionObj: any = {};

  @property({type: Boolean, reflect: true})
  dialogOpened = false;

  @property({type: Object})
  activity: AnyObject = {};

  @property({type: Object})
  toastEventSource!: LitElement;

  @property({type: Object})
  get permissions() {
    return this._permissionObj;
  }

  set permissions(permissions) {
    this.permissionObjChanged(permissions);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  permissionObjChanged(permissions: ProgrammeManagementActivityPermissions) {
    if (!permissions) {
      this._permissionObj = {};
      return;
    }
    this._permissionObj = permissions;
  }

  public openDialog() {
    this.dialogOpened = true;
  }

  onSaveClick() {
    const endpoint: EtoolsRequestEndpoint = getEndpoint(interventionEndpoints.interventionBudgetUpdate, {
      activity_budget: this.activity
    });
    sendRequest({
      endpoint,
      method: 'PATCH',
      body: this.activity
    })
      .then(() => {
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch(() => {
        fireEvent(this, 'toast', {text: 'Can not save activity budget!'});
      });
  }

  public closeDialog() {
    this.dialogOpened = false;
  }
}
