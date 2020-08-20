import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown';
import '@polymer/paper-input/paper-textarea';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {buttonsStyles} from '../../common/styles/button-styles';
import {validateRequiredFields} from '../../utils/validation-helper';
import {Permission} from '../../common/models/intervention.types';
import {RiskPermissions} from './risk.models';
import {AnyObject} from '../../common/models/globals.types';

/**
 * @customElement
 */
@customElement('risk-dialog')
export class RiskDialog extends connect(getStore())(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    return html`
      <style>
        ${sharedStyles} paper-textarea {
          flex: auto;
          --paper-input-container-input: {
            display: block;
          }
        }
      </style>

      <etools-dialog
        no-padding
        keep-dialog-open
        id="riskDialog"
        size="md"
        ?opened="${this.dialogOpened}"
        ok-btn-text="Save"
        dialog-title="${this.riskDialogTitle}"
        @close="${() => this.handleDialogClose()}"
        @confirm-btn-clicked="${() => this._validateAndSaveRisk()}"
      >
        <div class="row-padding layout-horizontal">
          <div class="col col-4">
            <etools-dropdown
              id="type"
              label="Type"
              .options="${this.riskTypes}"
              .selected="${this.currentRisk}"
              option-value="id"
              option-label="risk_type"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.risk_type)}"
              ?required="${this.permissions.required.risk_type}"
            >
            </etools-dropdown>
          </div>
          <div class="col col-8">
            <paper-textarea
              id="mitigationMeasures"
              label="Proposed mitigation measures"
              always-float-label
              type="text"
              placeholder="—"
              .value="${this.data.mitigation_measures}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'mitigation_measures')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.mitigation_measures)}"
              ?required="${this.permissions.required.mitigation_measures}"
            >
            </paper-textarea>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  private riskTypes = [
    {id: '0', risk_type: 'Social & Environmental'},
    {id: '1', risk_type: 'Financial'},
    {id: '2', risk_type: 'Operational'},
    {id: '3', risk_type: 'Organizational'},
    {id: '4', risk_type: 'Political'},
    {id: '5', risk_type: 'Strategic'},
    {id: '6', risk_type: 'Safety & security'}
  ];

  @property({type: Boolean, reflect: true})
  dialogOpened = false;

  @property() riskDialogTitle = '';

  @property() isEditDialog = false;

  @property({type: Object})
  toastEventSource!: LitElement;

  @property({type: Object})
  permissions!: Permission<RiskPermissions>;

  @property({type: Object})
  data!: any;

  @property({type: Object})
  currentRisk: AnyObject = {};

  public openDialog() {
    this.dialogOpened = true;
    this.editMode = true;
    if (this.data.risk_type !== undefined) {
      this.riskDialogTitle = 'Edit risk';
      this.currentRisk = this.data.risk_type.id;
    } else {
      this.riskDialogTitle = 'Add risk';
    }
  }

  _resetFields() {
    this.data = {};
    this.currentRisk = {};
  }

  public handleDialogClose() {
    this.dialogOpened = false;
    this.editMode = false;
    this._resetFields();
  }

  _validateAndSaveRisk() {
    if (!validateRequiredFields(this)) {
      return;
    }
    this._saveRisk(this.data);
  }

  _saveRisk(data: any) {
    console.log(data);
  }
}
