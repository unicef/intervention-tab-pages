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
        [hidden] {
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
        dialog-title="Add activity"
        ?opened="${this.dialogOpened}"
        @close="${() => this.closeDialog()}"
      >
        <div class="row-padding-v">
          <paper-input id="title" label="Title" always-float-label placeholder="—"> </paper-input>
        </div>

        <div class="row-padding-v">
          <paper-textarea id="description" label="Description" always-float-label placeholder="—"></paper-textarea>
        </div>

        <div class="layout-horizontal">
          <div class="col col-6">
            <etools-currency-amount-input id="unicefCash" label="UNICEF cash"> </etools-currency-amount-input>
          </div>
          <div class="col col-6">
            <etools-currency-amount-input id="partnerContribution" label="Partner contribution">
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

  public closeDialog() {
    this.dialogOpened = false;
  }
}
