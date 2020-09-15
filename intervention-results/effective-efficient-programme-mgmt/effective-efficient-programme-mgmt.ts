import {customElement, html, LitElement, property} from 'lit-element';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-content-panel';
import '@unicef-polymer/etools-table/etools-table';
import {EtoolsTableChildRow, EtoolsTableColumn, EtoolsTableColumnType} from '@unicef-polymer/etools-table/etools-table';
import '@unicef-polymer/etools-currency-amount-input';
import './activity-dialog';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {elevationStyles} from '../../common/styles/elevation-styles';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import {isJsonStrMatch} from '../../utils/utils';
import {openDialog} from '../../utils/dialog';
import {
  selectProgrammeManagement,
  selectProgrammeManagementActivityPermissions
} from './effectiveEfficientProgrammeMgmt.selectors';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {AnyObject, RootState} from '../../common/models/globals.types';
import cloneDeep from 'lodash-es/cloneDeep';
import {ProgrammeManagement} from './effectiveEfficientProgrammeMgmt.models';

const customStyles = html`
  <style>
    .row-actions {
      width: 10%;
    }
    .right-a {
      text-align: right;
    }
    .label-input {
      font-size: 12px;
      line-height: 16px;
      color: var(--secondary-text-color);
    }
  </style>
`;
/**
 * @customElement
 */
@customElement('effective-and-efficient-programme-management')
export class EffectiveAndEfficientProgrammeManagement extends connect(getStore())(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles, elevationStyles];
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
        ${sharedStyles}
      </style>
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
          --ecp-content-padding: 0;
          --ecp-content_-_padding: 0;
        }
        etools-table {
          padding-top: 0;
        }
      </style>

      <etools-content-panel show-expand-btn panel-title="Effective and efficient programme management">
        <div slot="panel-btns">Total: ${this.total_amount}</div>

        <etools-table
          .items="${this.formattedData}"
          .columns="${this.columns}"
          .extraCSS="${this.getTableStyle()}"
          .showEdit=${this.canEdit}
          @edit-item="${this.openActivityDialog}"
          .getChildRowTemplateMethod="${this.getChildRowTemplate.bind(this)}"
        >
        </etools-table>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  formattedData!: AnyObject[];

  @property({type: Boolean})
  showLoading = false;

  @property({type: Boolean})
  canEdit = true;

  @property({type: Object})
  data!: ProgrammeManagement;

  @property({type: Array})
  columns: EtoolsTableColumn[] = [
    {
      label: 'Item (all prices in PD currency)',
      name: 'title',
      type: EtoolsTableColumnType.Text
    },
    {
      label: 'Unicef Cash',
      name: 'unicef_cash',
      type: EtoolsTableColumnType.Number
    },
    {
      label: 'Partner Contribution',
      name: 'partner_contribution',
      type: EtoolsTableColumnType.Number
    },
    {
      label: 'Total',
      name: 'total',
      cssClass: 'right-a',
      type: EtoolsTableColumnType.Number
    }
  ];

  @property({type: Number})
  total_amount = '0';

  @property({type: Number})
  interventionId!: number;

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: RootState) {
    if (!state.interventions.current) {
      return;
    }
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'results')) {
      return;
    }
    this.interventionId = state.interventions.current.id!;
    this.data = selectProgrammeManagement(state);
    this.originalData = cloneDeep(this.data);

    const newPermissions = selectProgrammeManagementActivityPermissions(state);
    if (!isJsonStrMatch(this.permissions, newPermissions)) {
      this.canEdit = newPermissions.edit.management_budgets;
    }
    this.formattedData = this.formatData(this.data);
  }

  formatData(data: ProgrammeManagement) {
    this.total_amount = data.total || '0';
    return [
      {
        title: 'In-country management and support staff',
        description:
          'Contribution for In-country management and support staff prorated to their contribution to the' +
          ' programme (representation, planning, coordination, logistics, administration, finance contribution for' +
          ' Operational costs prorated to their contribution to the programme (office space, equipment,' +
          ' office supplies, maintenance',
        unicef_cash: data.act1_unicef,
        partner_contribution: data.act1_partner,
        total: data.act1_total,
        index: 1
      },
      {
        title: 'Operational costs',
        description:
          'Contribution for Operational costs prorated to their contribution to the programme (office space,' +
          ' equipment, office supplies, maintenance)',
        unicef_cash: data.act2_unicef,
        partner_contribution: data.act2_partner,
        total: data.act2_total,
        index: 2
      },
      {
        title: 'Planning, monitoring, evaluation and communication',
        description:
          'Contribution for Planning, monitoring, evaluation and communication, prorated to their' +
          ' contribution to the programme (venue, travels, etc.)',
        unicef_cash: data.act3_unicef,
        partner_contribution: data.act3_partner,
        total: data.act3_total,
        index: 3
      }
    ];
  }

  getTableStyle() {
    return html`<style>
        ${sharedStyles}
      </style>
      ${customStyles}`;
  }

  openActivityDialog(event: CustomEvent) {
    openDialog({
      dialog: 'activity-dialog',
      dialogData: {
        activity: event.detail,
        interventionId: this.interventionId
      }
    });
  }

  getChildRowTemplate(item: any): EtoolsTableChildRow {
    const childRow = {} as EtoolsTableChildRow;
    childRow.showExpanded = false;
    childRow.rowHTML = html`
      <td colspan="7">
        <div class="child-row-inner-container">
          <label class="label-input">Description</label><br />
          <label>${item.description}</label>
        </div>
      </td>
    `;
    return childRow;
  }
}
