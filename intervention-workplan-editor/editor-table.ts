import {customElement, html, LitElement, property} from 'lit-element';
import {EditorTableStyles} from './editor-table-styles';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons';
import '@polymer/paper-input/paper-textarea';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {TABS} from '../common/constants';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {RootState} from '../../../../../redux/store';
import {
  selectInterventionId,
  selectInterventionQuarters,
  selectInterventionResultLinks,
  selectInterventionStatus,
  selectResultLinksPermissions
} from '../intervention-workplan/results-structure/results-structure.selectors';
import {currentIntervention, isUnicefUser} from '../common/selectors';
import {
  ExpectedResult,
  Intervention,
  ResultLinkLowerResult
} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import {
  InterventionActivity,
  InterventionActivityItem,
  InterventionQuarter
} from '@unicef-polymer/etools-types/dist/intervention.types';
import {cloneDeep} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {repeat} from 'lit-html/directives/repeat';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';

@customElement('editor-table')
export class EditorTable extends connectStore(LitElement) {
  static get styles() {
    return [EditorTableStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <table>
        ${repeat(
          this.resultLinks,
          (result: ExpectedResult) => result.id,
          (result, _index) => html`
            <thead>
              <tr class="edit blue">
                <td class="first-col"></td>
                <td colspan="3"></td>
                <td class="col-g"></td>
                <td class="col-g"></td>
                <td class="col-g"></td>
                <td class="col-6">
                  <paper-icon-button icon="create"></paper-icon-button>
                </td>
              </tr>
              <tr class="header blue">
                <td>ID</td>
                <td colspan="3">Country Programme Output</td>
                <td></td>
                <td>CSO Contribution</td>
                <td>UNICEF Cash</td>
                <td>Total</td>
              </tr>
            </thead>
            <tbody>
              <tr class="text blue">
                <td>${result.code}</td>
                <td colspan="3" class="b">${result.cp_output_name}</td>
                <td></td>
                <td>N/A</td>
                <td>N/A</td>
                <td>${result.total}</td>
              </tr>
              <tr class="add blue">
                <td></td>
                <td colspan="3"><paper-icon-button icon="add-box"></paper-icon-button> Add New PD Output</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
            ${result.ll_results.map(
              (pdOutput: ResultLinkLowerResult) => html`
                <thead class="gray-1">
                  <tr class="edit">
                    <td class="first-col"></td>
                    <td colspan="3"></td>
                    <td class="col-g"></td>
                    <td class="col-g"></td>
                    <td class="col-g"></td>
                    <td class="col-6">
                      <paper-icon-button icon="create"></paper-icon-button>
                    </td>
                  </tr>
                  <tr class="header">
                    <td></td>
                    <td colspan="3">PD Output</td>
                    <td></td>
                    <td>CSO Contribution</td>
                    <td>UNICEF Cash</td>
                    <td>Total</td>
                  </tr>
                </thead>
                <tbody class="gray-1">
                  <tr class="text">
                    <td>${pdOutput.code}</td>
                    <td colspan="3" class="b">
                      <paper-textarea no-label-float .value="${pdOutput.name}" readonly></paper-textarea>
                    </td>
                    <td></td>
                    <td>N/A</td>
                    <td>N/A</td>
                    <td>
                      ${this.intervention.planned_budget.currency} ${displayCurrencyAmount(pdOutput.total, '0.00')}
                    </td>
                  </tr>
                  <tr class="add">
                    <td></td>
                    <td colspan="3">
                      <paper-icon-button icon="add-box" ?hidden="${this.readonly}"></paper-icon-button> Add New Activity
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>

                ${pdOutput.activities.map(
                  (activity: InterventionActivity) => html`
                    <thead>
                      <tr class="edit">
                        <td class="first-col"></td>
                        <td colspan="3"></td>
                        <td class="col-g"></td>
                        <td class="col-g"></td>
                        <td class="col-g"></td>
                        <td class="col-6">
                          <paper-icon-button icon="create"></paper-icon-button>
                        </td>
                      </tr>
                      <tr class="header">
                        <td></td>
                        <td colspan="3">Activity</td>
                        <td>Time Periods</td>
                        <td>CSO Contribution</td>
                        <td>UNICEF Cash</td>
                        <td>Total</td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="text border-b">
                        <td>${activity.code}</td>
                        <td colspan="3" class="b">
                          <paper-textarea no-label-float .value="${activity.name}" readonly></paper-textarea>
                          <div class="pad-top-8">
                            <paper-textarea
                              label="Other Notes"
                              always-float-label
                              readonly
                              .value="${activity.context_details}"
                            ></paper-textarea>
                          </div>
                        </td>
                        <td></td>
                        <td>
                          <etools-currency-amount-input .value="${activity.cso_cash}"></etools-currency-amount-input>
                        </td>
                        <td>
                          <etools-currency-amount-input .value="${activity.unicef_cash}"></etools-currency-amount-input>
                        </td>
                        <td>
                          ${displayCurrencyAmount(
                            String(this.getTotal(activity.cso_cash, activity.unicef_cash)),
                            '0',
                            2
                          )}
                        </td>
                      </tr>
                    </tbody>

                    ${activity.items?.map(
                      (item: InterventionActivityItem) => html`
                        <thead>
                          <tr class="header border-b">
                            <td class="first-col"></td>
                            <td class="col-30">Item Description</td>
                            <td class="col-10">Unit</td>
                            <td class="col-10">Number Of Units</td>
                            <td class="col-g">Price/Unit</td>
                            <td class="col-g">Partner Cash</td>
                            <td class="col-g">UNICEF CASH</td>
                            <td class="col-g">Total</td>
                          </tr>
                          <tr class="border-b">
                            <td></td>
                            <td><paper-icon-button icon="add-box"></paper-icon-button> Add New Item</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                        </thead>
                        <tbody class="odd">
                          <tr>
                            <td>${item.code || 'N/A'}</td>
                            <td><paper-textarea no-label-float .value="${item.name}"></paper-textarea></td>
                            <td><paper-input .value="${item.unit}"></paper-input></td>
                            <td>
                              <etools-currency-amount-input .value="${item.no_units}"></etools-currency-amount-input>
                            </td>
                            <td>
                              <etools-currency-amount-input .value="${item.unit_price}"></etools-currency-amount-input>
                            </td>
                            <td>
                              <etools-currency-amount-input .value="${item.cso_cash}"></etools-currency-amount-input>
                            </td>
                            <td>
                              <etools-currency-amount-input .value="${item.unicef_cash}"></etools-currency-amount-input>
                            </td>
                            <td>${this.getTotal(item.cso_cash || 0, item.unicef_cash || 0)}</td>
                          </tr>
                        </tbody>
                      `
                    )}
                  `
                )}
              `
            )}
          `
        )}
      </table>
    `;
  }

  get resultLinks(): ExpectedResult[] {
    return this._resultLinks || [];
  }
  set resultLinks(data: ExpectedResult[]) {
    this._resultLinks = data.sort(
      (linkA, linkB) => Number(Boolean(linkB.cp_output)) - Number(Boolean(linkA.cp_output))
    );
  }
  @property() interventionId!: number | null;
  @property() interventionStatus!: string;

  quarters: InterventionQuarter[] = [];

  @property({type: Boolean}) isUnicefUser = true;
  @property({type: Object})
  permissions!: {
    edit: {result_links?: boolean};
    required: {result_links?: boolean};
  };

  @property() private _resultLinks: ExpectedResult[] | null = [];

  @property({type: Object})
  intervention!: Intervention;

  @property({type: Boolean})
  readonly = false;

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(state.app?.routeDetails, 'interventions', TABS.WorkplanEditor)) {
      return;
    }
    this.resultLinks = selectInterventionResultLinks(state);
    this.permissions = selectResultLinksPermissions(state);
    this.interventionId = selectInterventionId(state);
    this.interventionStatus = selectInterventionStatus(state);
    this.quarters = selectInterventionQuarters(state);
    // this.cpOutputs = (state.commonData && state.commonData.cpOutputs) || [];
    this.isUnicefUser = isUnicefUser(state);
    this.intervention = cloneDeep(currentIntervention(state));
  }

  getTotal(partner: string, unicef: string): number {
    return (Number(partner) || 0) + (Number(unicef) || 0);
  }
}
