import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-table/etools-table';
import '@unicef-polymer/etools-dropdown';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {buttonsStyles} from '../../common/styles/button-styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {Risk, RiskPermissions} from './risk.models';
import {Permission} from '../../common/models/intervention.types';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import sample from 'lodash-es/sample';
import {selectRiskPermissions, selectRisks} from './risk.selectors';
import './risk-dialog';
import {RiskDialog} from './risk-dialog';
import {EtoolsTableColumn, EtoolsTableColumnType} from '@unicef-polymer/etools-table/etools-table';

const customStyles = html`
  <style>
    .col_type {
      width: 15%;
    }
    .col_measures {
      width: 99%;
    }
  </style>
`;

const getRiskItems = () => {
  const arr = [];
  let i = 0;
  const riskTypes = [
    {id: '0', risk_type: 'Social & Environmental'},
    {id: '1', risk_type: 'Financial'},
    {id: '2', risk_type: 'Operational'},
    {id: '3', risk_type: 'Organizational'},
    {id: '4', risk_type: 'Political'},
    {id: '5', risk_type: 'Strategic'},
    {id: '6', risk_type: 'Safety & security'}
  ];
  while (i < 10) {
    const riskItem = new Risk();
    riskItem.risk_type = sample(riskTypes);
    riskItem.mitigation_measures = `Mittigation measure ${i}`;
    arr.push(riskItem);
    i++;
  }
  return arr;
};

/**
 * @customElement
 */
@customElement('risks-element')
export class RisksElement extends connect(getStore())(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [buttonsStyles, gridLayoutStylesLit];
  }

  render() {
    if (!this.data) {
      return html`<style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
      <style>
        ${sharedStyles} :host {
          display: block;
          margin-bottom: 24px;
        }
        #mitigationMeasures {
          width: 100%;
        }
      </style>
      <etools-content-panel show-expand-btn panel-title="Risks">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>
        <div slot="panel-btns">
          <paper-button
            class="secondary-btn"
            ?hidden="${!this.canEditAtLeastOneField}"
            @tap="${(e: CustomEvent) => this.openRiskDialog(e)}"
          >
            <iron-icon icon="add"></iron-icon>
          </paper-button>
        </div>
        <etools-table
          .columns="${this.columns}"
          .items="${this.data}"
          @edit-item="${(e: CustomEvent) => this.openRiskDialog(e)}"
          .extraCSS="${this.getTableStyle()}"
          .showEdit=${this.canEditAtLeastOneField}
        >
        </etools-table>
      </etools-content-panel>
    `;
  }

  private riskDialog!: RiskDialog;

  @property({type: Boolean})
  showLoading = false;

  @property({type: Object})
  data!: Risk[];

  @property({type: Object})
  originalData!: Risk[];

  @property({type: Object})
  permissions!: Permission<RiskPermissions>;

  @property({type: Array})
  columns: EtoolsTableColumn[] = [
    {
      label: 'Type',
      name: 'risk_type',
      type: EtoolsTableColumnType.Custom,
      customMethod: (item: any) => {
        return item ? item.risk_type.risk_type : '-';
      },
      cssClass: 'col_type'
    },
    {
      label: 'Proposed mitigation measures',
      name: 'mitigation_measures',
      type: EtoolsTableColumnType.Text,
      cssClass: 'col_measures'
    }
  ];

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeRiskDialog();
  }

  stateChanged(state: any) {
    if (!state.interventions.current) {
      return;
    }
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'management')) {
      return;
    }
    // this.data = [selectRisks(state)];
    this.data = getRiskItems();
    this.permissions = selectRiskPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
  }

  getTableStyle() {
    return html`<style>
        ${sharedStyles}
      </style>
      ${customStyles}`;
  }

  openRiskDialog(e: CustomEvent) {
    this._createRiskDialog();
    this.riskDialog.data = e.detail;
    this.riskDialog.permissions = this.permissions;
    (this.riskDialog as RiskDialog).openDialog();
  }

  _createRiskDialog() {
    if (!this.riskDialog) {
      this.riskDialog = document.createElement('risk-dialog') as RiskDialog;
      this.riskDialog.setAttribute('id', 'riskDialog');
      this.riskDialog.toastEventSource = this;
      document.querySelector('body')!.appendChild(this.riskDialog);
    }
  }

  removeRiskDialog() {
    if (this.riskDialog) {
      document.querySelector('body')!.removeChild(this.riskDialog);
    }
  }
}
