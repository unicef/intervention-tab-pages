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
import {AnyObject, RootState} from '../../common/models/globals.types';
import {InterventionSupplyItem, Intervention, ExpectedResult} from '../../common/models/intervention.types';
import {openDialog} from '../../utils/dialog';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {selectSupplyAgreement, selectSupplyAgreementPermissions} from './supplyAgreement.selectors';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '../../utils/fire-custom-event';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {updateCurrentIntervention} from '../../common/actions';
import '../../common/layout/are-you-sure';

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
    if (!this.supply_items) {
      return html`<style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      <style>
        ${sharedStyles} :host {
          display: block;
          margin-bottom: 24px;
          --ecp-content-padding: 0;
          --ecp-content_-_padding: 0;
        }
        .mr-40 {
          margin-right: 40px;
        }
        .f-12 {
          font-size: 12px;
        }
      </style>

      <etools-content-panel show-expand-btn panel-title="Supply Agreement">
        <div slot="panel-btns">
          <span class="mr-40">
            <label class="label-input font-bold">TOTAL SUPPLY BUDGET: </label>
            <label class="f-12 font-bold">${this.intervention.planned_budget.currency} ${this.intervention.planned_budget.in_kind_amount_local}</label>
          </span>
          <paper-icon-button
            ?hidden="${!this.permissions.edit.supply_items}"
            @tap="${() => this.addSupplyItem()}"
            icon="add-box"
          >
          </paper-icon-button>
        </div>

        <etools-table
          .columns="${this.columns}"
          .items="${this.supply_items}"
          @edit-item="${this.editSupplyItem}"
          @delete-item="${this.confirmDeleteSupplyItem}"
          .getChildRowTemplateMethod="${this.getChildRowTemplate.bind(this)}"
          .extraCSS="${this.getTableStyle()}"
          .showEdit=${this.permissions.edit.supply_items}
          .showDelete=${this.permissions.edit.supply_items}
        >
        </etools-table>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  supply_items!: AnyObject[];

  @property({type: Object})
  intervention!: Intervention;

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

  @property({type: Object})
  permissions!: {edit: {supply_items?: boolean}};

  getChildRowTemplate(item: any): EtoolsTableChildRow {
    const childRow = {} as EtoolsTableChildRow;
    childRow.showExpanded = false;
    const resultLink = this.intervention.result_links.find((result: ExpectedResult) => result.id === item.result);
    const output = resultLink ? resultLink.cp_output_name : '';
    childRow.rowHTML = html`
      <td></td>
      <td class="ptb-0">
        <div class="child-row-inner-container">
          <label class="label-input">Cp Outputs</label><br />
            <label>${output}</label><br />
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

  stateChanged(state: RootState): void {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'results')) {
      return;
    }
    if (get(state, 'interventions.current')) {
      const currentIntervention = get(state, 'interventions.current');
      this.intervention = cloneDeep(currentIntervention);
    }
    this.supply_items = selectSupplyAgreement(state);
    this.permissions = selectSupplyAgreementPermissions(state);
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

  async confirmDeleteSupplyItem(e: CustomEvent) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: 'Are you sure you want to delete this Supply Agreement item?',
        confirmBtnText: 'Delete'
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deleteSupplyItem(e.detail.id);
    }
  }

  deleteSupplyItem(supplyId: number) {
    const endpoint = getEndpoint(interventionEndpoints.supplyAgreementEdit, {
      interventionId: this.intervention.id,
      supplyId: supplyId
    });

    sendRequest({
      endpoint: endpoint,
      method: 'DELETE'
    })
      .then((_resp: any) => {
        this.intervention.supply_items = this.intervention.supply_items.filter((el: AnyObject) => el.id !== supplyId);
        getStore().dispatch(updateCurrentIntervention(this.intervention));
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
      });
  }

  private openSupplyDialog(item: InterventionSupplyItem) {
    openDialog({
      dialog: 'supply-agreement-dialog',
      dialogData: {
        data: item,
        interventionId: this.intervention.id,
        result_links: this.intervention.result_links
      }
    });
  }
}
