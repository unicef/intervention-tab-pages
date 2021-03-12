import {customElement, html, LitElement, property} from 'lit-element';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-content-panel';
import '@unicef-polymer/etools-table/etools-table';
import {EtoolsTableChildRow, EtoolsTableColumn, EtoolsTableColumnType} from '@unicef-polymer/etools-table/etools-table';
import '@unicef-polymer/etools-currency-amount-input';
import './activity-dialog';
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
import {RootState} from '../../common/types/store.types';
import cloneDeep from 'lodash-es/cloneDeep';
import {ProgrammeManagement} from './effectiveEfficientProgrammeMgmt.models';
import {addCurrencyAmountDelimiter} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

const customStyles = html`
  <style>
    .row-actions {
      width: 10%;
    }
    .right-a {
      text-align: right;
    }
  </style>
`;
/**
 * @customElement
 */
@customElement('effective-and-efficient-programme-management')
export class EffectiveAndEfficientProgrammeManagement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles, elevationStyles];
  }

  render() {
    if (!this.data || this.data.constructor == Object) {
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
        }

        etools-table {
          padding-top: 0;
        }
        .pad-right {
          padding-right: 6px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('INTERVENTION_RESULTS.EFF_EFF_PROG_MGM.EFFECTIVE_EFFICIENT_PROG_MGM')}
        comment-element="programme-management"
        comment-description=${translate('INTERVENTION_RESULTS.EFF_EFF_PROG_MGM.EFFECTIVE_EFFICIENT_PROG_MGM')}
      >
        <div slot="panel-btns">
          <label class="paper-label font-bold pad-right"
            >${translate('INTERVENTION_RESULTS.EFF_EFF_PROG_MGM.TOTAL')}</label
          ><label class="font-bold-12">${this.data.currency} ${this.total_amount}</label>
        </div>

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
      label: (translate('INTERVENTION_RESULTS.EFF_EFF_PROG_MGM.ITEM_PD_CURRENCY') as unknown) as string,
      name: 'title',
      type: EtoolsTableColumnType.Text
    },
    {
      label: (translate('INTERVENTION_RESULTS.EFF_EFF_PROG_MGM.PARTNER_CASH') as unknown) as string,
      name: 'partner_contribution',
      type: EtoolsTableColumnType.Number
    },
    {
      label: (translate('INTERVENTION_RESULTS.EFF_EFF_PROG_MGM.UNICEF_CASH') as unknown) as string,
      name: 'unicef_cash',
      type: EtoolsTableColumnType.Number
    },
    {
      label: (translate('GENERAL.TOTAL') as unknown) as string,
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
    super.stateChanged(state);
  }

  formatData(data: ProgrammeManagement) {
    this.total_amount = addCurrencyAmountDelimiter(data.total) || '0';
    return [
      {
        title: translate('INTERVENTION_RESULTS.EFF_EFF_PROG_MGM.TITLE_1'),
        description: translate('INTERVENTION_RESULTS.EFF_EFF_PROG_MGM.DESCRIPTION_1'),
        partner_contribution: addCurrencyAmountDelimiter(data.act1_partner),
        unicef_cash: addCurrencyAmountDelimiter(data.act1_unicef),
        total: addCurrencyAmountDelimiter(data.act1_total),
        index: 1
      },
      {
        title: translate('INTERVENTION_RESULTS.EFF_EFF_PROG_MGM.TITLE_2'),
        description: translate('INTERVENTION_RESULTS.EFF_EFF_PROG_MGM.DESCRIPTION_2'),
        partner_contribution: addCurrencyAmountDelimiter(data.act2_partner),
        unicef_cash: addCurrencyAmountDelimiter(data.act2_unicef),
        total: addCurrencyAmountDelimiter(data.act2_total),
        index: 2
      },
      {
        title: translate('INTERVENTION_RESULTS.EFF_EFF_PROG_MGM.TITLE_3'),
        description: translate('INTERVENTION_RESULTS.EFF_EFF_PROG_MGM.DESCRIPTION_3'),
        partner_contribution: addCurrencyAmountDelimiter(data.act3_partner),
        unicef_cash: addCurrencyAmountDelimiter(data.act3_unicef),
        total: addCurrencyAmountDelimiter(data.act3_total),
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
          <label class="paper-label">${translate('GENERAL.DESCRIPTION')}</label><br />
          <label>${item.description}</label>
        </div>
      </td>
    `;
    return childRow;
  }
}
