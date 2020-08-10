import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@unicef-polymer/etools-table/etools-table';
import {getStore} from '../../utils/redux-store-access';
import {connect} from 'pwa-helpers/connect-mixin';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import '@unicef-polymer/etools-loading';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {EtoolsTableColumn, EtoolsTableColumnType, EtoolsTableChildRow} from '@unicef-polymer/etools-table/etools-table';
import './supply-agreement-dialog';
import {SupplyAgreementDialog} from './supply-agreement-dialog';
import {InterventionSupplyItem} from '../../common/models/intervention.types';
import {AnyObject} from '../../common/models/globals.types';

const getSupplyItems = () => {
  const arr = [];
  let i = 0;
  while (i < 10) {
    const supplyItem = new InterventionSupplyItem();
    supplyItem.id = i;
    supplyItem.title = `Title ${i}`;
    supplyItem.result = `CP Output ${i}`;
    supplyItem.other_mentions = `Other mentions ${i}`;
    supplyItem.unit_number = i;
    supplyItem.unit_price = Math.floor(Math.random() * Math.floor(15));
    supplyItem.total_price = supplyItem.unit_number * supplyItem.unit_price;
    supplyItem.outputs = ['CP Output Health Related', 'CP Output Health Related', 'CP Output Health Related'];
    arr.push(supplyItem);
    i++;
  }
  return arr;
};

const customStyles = html`
  <style>
    .col_title {
      width: 99%;
    }
    .col_nowrap {
      width: 1%;
      white-space: nowrap;
    }
    .expand-cell iron-icon {
      width: 70px !important;
      color: #2b2b2b !important;
    }
  </style>
`;

@customElement('supply-agreements')
export class FollowUpPage extends connect(getStore())(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    return html`
      <style>
        ${sharedStyles} :host {
          display: block;
          margin-bottom: 24px;
          --ecp-content-padding: 0;
        }
        .mr-40 {
          margin-right: 40px;
        }
        .f-12 {
          font-size: 12px;
        }
      </style>
      <etools-content-panel panel-title="Supply Agreement">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>

        <div slot="panel-btns">
          <span class="mr-40">
            <label class="label-input font-bold">TOTAL SUPPLY BUDGET: </label>
            <label class="f-12 font-bold">LBP 54353</label>
          </span>
          <paper-icon-button ?hidden="${!this.canEditSupply}" @tap="${() => this.addSupplyItem()}" icon="add">
          </paper-icon-button>
        </div>

        <etools-table
          .columns="${this.columns}"
          .items="${this.dataItems}"
          @edit-item="${this.editSupplyItem}"
          @delete-item="${this.deleteSupplyItem}"
          .getChildRowTemplateMethod="${this.getChildRowTemplate.bind(this)}"
          .extraCSS="${this.getTableStyle()}"
          .showEdit=${this.canEditSupply}
          .showDelete=${this.canEditSupply}
        >
        </etools-table>
      </etools-content-panel>
    `;
  }

  private supplyItemDialog!: SupplyAgreementDialog;

  @property({type: Array})
  dataItems: AnyObject[] = [];

  @property({type: Boolean})
  showLoading = false;

  @property({type: Array})
  columns: EtoolsTableColumn[] = [
    {
      label: 'Item (all prices in PD Currency)',
      name: 'title',
      type: EtoolsTableColumnType.Text,
      cssClass: 'col_title'
    },
    {
      label: 'Number of Units',
      name: 'unit_number',
      type: EtoolsTableColumnType.Number,
      cssClass: 'col_nowrap'
    },
    {
      label: 'Price / Unit',
      name: 'unit_price',
      type: EtoolsTableColumnType.Number,
      cssClass: 'col_nowrap'
    },
    {
      label: 'Total Price',
      name: 'total_price',
      cssClass: 'col_nowrap',
      type: EtoolsTableColumnType.Number
    }
  ];

  @property({type: Boolean})
  canEditSupply = true;

  stateChanged(_state: any) {
    this.dataItems = getSupplyItems();
  }

  getChildRowTemplate(item: any): EtoolsTableChildRow {
    const childRow = {} as EtoolsTableChildRow;
    childRow.showExpanded = false;
    childRow.rowHTML = html`
      <td></td>
      <td class="ptb-0">
        <div class="child-row-inner-container">
          <label class="label-input">Cp Outputs</label><br />
          ${item.outputs.map((output: string) => html`<label>${output}</label><br />`)}
        </div>
      </td>
      <td colspan="4" class="ptb-0">
        <div class="child-row-inner-container">
          <label class="label-input">Other Mentions</label><br />
          <label>${item.other_mentions}</label>
          </paper-input>
        </div>
      </td>
    `;
    return childRow;
  }

  getTableStyle() {
    return html`<style>
        ${sharedStyles}
      </style>
      ${customStyles}`;
  }

  cancelSupply() {
    this.editMode = false;
  }

  editSupplyItem(e: CustomEvent) {
    this.openSupplyDialog(e.detail);
  }

  addSupplyItem() {
    this.openSupplyDialog(new InterventionSupplyItem());
  }

  deleteSupplyItem(event: CustomEvent) {
    console.log(event);
  }

  private openSupplyDialog(item: InterventionSupplyItem) {
    this.createDialog();
    this.supplyItemDialog.supplyItem = item;
    this.supplyItemDialog.openDialog();
  }

  createDialog() {
    if (!this.supplyItemDialog) {
      this.supplyItemDialog = document.createElement('supply-agreement-dialog') as SupplyAgreementDialog;
      document.querySelector('body')!.appendChild(this.supplyItemDialog);
    }
  }
}
