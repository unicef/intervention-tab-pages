import {customElement, html, LitElement, property} from 'lit-element';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-content-panel';
import '@unicef-polymer/etools-table/etools-table';
import {EtoolsTableChildRow, EtoolsTableColumn, EtoolsTableColumnType} from '@unicef-polymer/etools-table/etools-table';
import '@unicef-polymer/etools-currency-amount-input';
import './activity-dialog';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import get from 'lodash-es/get';
import {isJsonStrMatch} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {
  selectProgrammeManagement,
  selectProgrammeManagementActivityPermissions
} from './effectiveEfficientProgrammeMgmt.selectors';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {RootState} from '../../common/types/store.types';
import cloneDeep from 'lodash-es/cloneDeep';
import {KindChoices, ProgrammeManagement} from './effectiveEfficientProgrammeMgmt.models';
import {addCurrencyAmountDelimiter} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject} from '@unicef-polymer/etools-types';
import {get as getTranslation, translate} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {TABS} from '../../common/constants';
import '@unicef-polymer/etools-info-tooltip/info-icon-tooltip';

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
      return html` ${sharedStyles}
        <etools-loading source="eepm" loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
          --etools-table-col-font-size: 16px;
        }

        etools-table {
          padding-top: 0;
        }
        .pad-right {
          padding-right: 6px;
          text-transform: uppercase;
        }
        info-icon-tooltip {
          --iit-margin: 8px 0 8px -15px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate(translatesMap.management_budgets)}
        comment-element="programme-management"
        comment-description=${translate(translatesMap.management_budgets)}
      >
        <div slot="after-title">
          <info-icon-tooltip
            id="iit-eepm"
            ?hidden="${!this.canEdit}"
            .tooltipText="${translate('EFFECTIVE_AND_EFFICIENT_PRGMT_MNGMT_INFO')}"
          ></info-icon-tooltip>
        </div>
        <div slot="panel-btns">
          <label class="paper-label font-bold pad-right">${translate('TOTAL')}:</label
          ><label class="font-bold-12">${this.data.currency} ${this.total_amount}</label>
        </div>

        <etools-table
          .items="${this.formattedData}"
          .columns="${this.columns}"
          .extraCSS="${this.getTableStyle()}"
          .showEdit=${this.canEdit}
          .showView=${!this.canEdit}
          @edit-item="${this.openActivityDialog}"
          @view-item="${this.openActivityDialog}"
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
      label: translate('ITEM_PD_CURRENCY') as unknown as string,
      name: 'title',
      type: EtoolsTableColumnType.Text
    },
    {
      label: translate('PARTNER_CASH') as unknown as string,
      name: 'partner_contribution',
      type: EtoolsTableColumnType.Number
    },
    {
      label: translate('UNICEF_CASH') as unknown as string,
      name: 'unicef_cash',
      type: EtoolsTableColumnType.Number
    },
    {
      label: '',
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
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Workplan)) {
      return;
    }
    this.interventionId = state.interventions.current.id!;
    this.data = selectProgrammeManagement(state);
    this.currencyDisplayForTotal();

    this.originalData = cloneDeep(this.data);

    const newPermissions = selectProgrammeManagementActivityPermissions(state);
    if (!isJsonStrMatch(this.permissions, newPermissions)) {
      this.canEdit = newPermissions.edit.management_budgets;
    }
    this.formattedData = this.formatData(this.data);
    super.stateChanged(state);
  }

  currencyDisplayForTotal() {
    this.columns[3].label = getTranslation('GENERAL.TOTAL') + ' (' + this.data.currency + ')';
  }

  formatData(data: ProgrammeManagement) {
    this.total_amount = addCurrencyAmountDelimiter(data.total) || '0';
    return [
      {
        title: translate('TITLE_1'),
        description: translate('DESCRIPTION_1'),
        partner_contribution: addCurrencyAmountDelimiter(data.act1_partner),
        unicef_cash: addCurrencyAmountDelimiter(data.act1_unicef),
        total: addCurrencyAmountDelimiter(data.act1_total),
        index: 1,
        kind: KindChoices.inCountry
      },
      {
        title: translate('TITLE_2'),
        description: translate('DESCRIPTION_2'),
        partner_contribution: addCurrencyAmountDelimiter(data.act2_partner),
        unicef_cash: addCurrencyAmountDelimiter(data.act2_unicef),
        total: addCurrencyAmountDelimiter(data.act2_total),
        index: 2,
        kind: KindChoices.operational
      },
      {
        title: translate('TITLE_3'),
        description: translate('DESCRIPTION_3'),
        partner_contribution: addCurrencyAmountDelimiter(data.act3_partner),
        unicef_cash: addCurrencyAmountDelimiter(data.act3_unicef),
        total: addCurrencyAmountDelimiter(data.act3_total),
        index: 3,
        kind: KindChoices.planning
      }
    ];
  }

  getTableStyle() {
    return html` ${sharedStyles} ${customStyles}`;
  }

  openActivityDialog(event: CustomEvent) {
    openDialog({
      dialog: 'activity-dialog',
      dialogData: {
        activity: {...event.detail, items: this.data.items},
        interventionId: this.interventionId,
        currency: this.data.currency,
        readonly: !this.canEdit
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
