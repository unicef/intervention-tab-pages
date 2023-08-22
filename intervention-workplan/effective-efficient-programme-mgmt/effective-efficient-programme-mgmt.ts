import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import './activity-dialog';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import get from 'lodash-es/get';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {
  selectProgrammeManagement,
  selectProgrammeManagementActivityPermissions
} from './effectiveEfficientProgrammeMgmt.selectors';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {RootState} from '../../common/types/store.types';
import cloneDeep from 'lodash-es/cloneDeep';
import {KindChoices, ProgrammeManagement} from './effectiveEfficientProgrammeMgmt.models';
import {addCurrencyAmountDelimiter} from '@unicef-polymer/etools-unicef/src/utils/currency';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject} from '@unicef-polymer/etools-types';
import {get as getTranslation, translate} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {TABS} from '../../common/constants';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/info-icon-tooltip';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';

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
        <etools-loading source="eepm" active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit} :host {
          display: block;
          margin-bottom: 24px;
          --etools-table-col-font-size: 16px;
        }

        etools-table {
          padding-top: 0;
        }
        .pad-right {
          padding-inline-end: 6px;
          text-transform: uppercase;
        }
        info-icon-tooltip {
          --iit-margin: 8px 0 8px -15px;
        }
        .actions {
          width: 100px;
        }
        .actions paper-icon-button {
          color: var(--dark-icon-color, #6f6f70);
        }
        .col-data,
        .row-details-content {
          font-size: 16px;
        }
        etools-data-table-row .actions {
          visibility: hidden;
          text-align: right;
        }
        etools-data-table-row:hover .actions {
          visibility: visible;
        }
        etools-data-table-row .actions paper-icon-button {
          height: 24px;
          padding: 0;
        }
        .text-right {
          place-content: end;
        }
      </style>

      <etools-content-panel show-expand-btn panel-title=${translate(translatesMap.management_budgets)}>
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

        <etools-data-table-header id="listHeader" no-title>
          <etools-data-table-column class="flex-7" field="title">
            ${translate('ITEM_PD_CURRENCY')}
          </etools-data-table-column>
          <etools-data-table-column class="flex-c text-right" field="partner_contribution">
            ${translate('PARTNER_CASH')}
          </etools-data-table-column>
          <etools-data-table-column class="flex-c text-right" field="unicef_cash">
            ${translate('UNICEF_CASH')}
          </etools-data-table-column>
          <etools-data-table-column class="flex-c text-right" field="total">
            ${getTranslation('GENERAL.TOTAL') + ' (' + this.data.currency + ')'}
          </etools-data-table-column>
          <etools-data-table-column class="actions"></etools-data-table-column>
        </etools-data-table-header>

        ${this.formattedData.map(
          (item: any) => html` <div comment-element="eepm-${item.index}">
            <etools-data-table-row>
              <div slot="row-data" class="layout-horizontal editable-row">
                <div class="col-data flex-7" data-col-header-label="${translate('ITEM_PD_CURRENCY')}">
                  ${item.title}
                </div>
                <div class="col-data flex-c text-right" data-col-header-label="${translate('PARTNER_FULL_NAME')}">
                  ${item.partner_contribution}
                </div>
                <div class="col-data flex-c text-right" data-col-header-label="${translate('PARTNER_CASH')}">
                  ${item.unicef_cash}
                </div>
                <div class="col-data flex-c text-right" data-col-header-label="${translate('TOTAL')}">
                  ${item.total}
                </div>
                <div class="actions">
                  <paper-icon-button
                    ?hidden="${!this.canEdit}"
                    icon="create"
                    @click="${() => this.openActivityDialog(item)}"
                    tabindex="0"
                  ></paper-icon-button>
                  <paper-icon-button
                    ?hidden="${this.canEdit}"
                    icon="icons:visibility"
                    @click="${() => this.openActivityDialog(item)}"
                    tabindex="0"
                  ></paper-icon-button>
                </div>
              </div>
              <div slot="row-data-details">
                <div class="row-details-content">
                  <label class="paper-label">${translate('GENERAL.DESCRIPTION')}</label><br />
                  <label>${item.description}</label>
                </div>
              </div>
            </etools-data-table-row>
          </div>`
        )}
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
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Workplan)) {
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

  openActivityDialog(activity: any) {
    openDialog({
      dialog: 'activity-dialog',
      dialogData: {
        activity: {...activity, items: cloneDeep(this.data.items)},
        interventionId: this.interventionId,
        currency: this.data.currency,
        readonly: !this.canEdit
      }
    });
  }
}
