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
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '../../utils/fire-custom-event';
import {RootState} from '../../../../../../redux/store';
import get from 'lodash-es/get';
import {InterventionActivityItem} from '../../common/models/intervention.types';

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
        keep-dialog-open
        dialog-title="Edit activity"
        ok-btn-text="Save"
        ?opened="${this.dialogOpened}"
        @close="${() => this.closeDialog()}"
        @confirm-btn-clicked="${this.onSaveClick}"
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
          ></paper-textarea>
        </div>

        <div class="layout-horizontal">
          <div class="col col-6">
            <etools-currency-amount-input
              id="unicefCash"
              label="UNICEF cash"
              .value="${this.activity.unicef_cash}"
              @value-changed="${({detail}: CustomEvent) => this.updateField('unicef_cash', detail.value)}"
            >
            </etools-currency-amount-input>
          </div>
          <div class="col col-6">
            <etools-currency-amount-input
              id="partnerContribution"
              label="Partner contribution"
              .value="${this.activity.partner_contribution}"
              @value-changed="${({detail}: CustomEvent) => this.updateField('partner_contribution', detail.value)}"
              ?readonly="${this.isReadonly(this.editMode, this._permissionObj.edit.programme_management_activity)}"
            >
            </etools-currency-amount-input>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  private _permissionObj: any = {};
  private interventionId: string = '';

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

  stateChanged(state: RootState) {
    this.interventionId = get(state, 'app.routeDetails.params.interventionId');
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
    this.editMode = true;
  }

  updateField(field: keyof AnyObject, value: any): void {
    const original = field === 'name' ? this.activity[field] : parseFloat(this.activity[field] as string);
    if (original === value) {
      return;
    }
    this.activity[field] = String(value);
    this.performUpdate();
  }

  onSaveClick() {
    sendRequest({
      endpoint: getEndpoint(interventionEndpoints.interventionBudgetUpdate, {
        interventionId: this.interventionId
      }),
      method: 'PATCH',
      body: {activity: this.activity}
    })
      .then((response) => {
        // console.log(response);
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch(() => {
        fireEvent(this, 'toast', {text: 'An error occurred. Try again.'});
      });
  }

  public closeDialog() {
    this.dialogOpened = false;
    this.editMode = false;
  }
}
