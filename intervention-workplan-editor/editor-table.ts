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
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';
import '@polymer/paper-button/paper-button';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../utils/intervention-endpoints';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {updateCurrentIntervention} from '../common/actions/interventions';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';

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
          (result, resultIndex) => html`
            <thead>
              <tr class="edit blue">
                <td class="first-col"></td>
                <td colspan="3"></td>
                <td colspan="3"></td>
                <td class="col-6"></td>
              </tr>
              <tr class="header blue">
                <td>ID</td>
                <td colspan="3">Country Programme Output</td>
                <td colspan="3"></td>
                <td class="money">Total</td>
              </tr>
            </thead>
            <tbody>
              <tr class="text blue">
                <td>${result.code}</td>
                <td colspan="3" class="b">${result.cp_output_name}</td>
                <td colspan="3"></td>
                <td class="money">
                  ${this.intervention.planned_budget.currency}
                  <span class="b">${displayCurrencyAmount(result.total, '0.00')}</span>
                </td>
              </tr>
              <tr class="add blue">
                <td></td>
                <td colspan="3">
                  <paper-icon-button
                    icon="add-box"
                    @click="${() => this.addNewPDOutput(result.ll_results)}"
                  ></paper-icon-button>
                  Add New PD Output
                </td>
                <td colspan="3"></td>
                <td></td>
              </tr>
            </tbody>
            ${result.ll_results.map(
              (pdOutput: ResultLinkLowerResult, pdOutputIndex) => html`
                <thead class="gray-1">
                  <tr class="edit">
                    <td class="first-col"></td>
                    <td colspan="3"></td>
                    <td colspan="3"></td>
                    <td class="col-6">
                      <paper-icon-button
                        icon="create"
                        ?hidden="${pdOutput.inEditMode}"
                        @click="${() => {
                          pdOutput.inEditMode = true;
                          this.requestUpdate();
                        }}"
                      ></paper-icon-button>
                    </td>
                  </tr>
                  <tr class="header">
                    <td></td>
                    <td colspan="3">PD Output</td>
                    <td colspan="3"></td>
                    <td class="money">Total</td>
                  </tr>
                </thead>
                <tbody class="gray-1">
                  <tr class="text">
                    <td>${pdOutput.code}</td>
                    <td colspan="3" class="b">
                      <paper-textarea
                        no-label-float
                        .value="${pdOutput.name}"
                        ?readonly="${!pdOutput.inEditMode}"
                        required
                        .invalid="${pdOutput.invalid}"
                        error-message="This field is required"
                        @value-changed="${({detail}: CustomEvent) => {
                          if (detail.value == pdOutput.name) {
                            return;
                          }
                          pdOutput.name = detail.value;
                          this.requestUpdate();
                        }}"
                      ></paper-textarea>
                    </td>
                    <td colspan="3"></td>
                    <td class="money">
                      ${this.intervention.planned_budget.currency}
                      <span class="b">${displayCurrencyAmount(pdOutput.total, '0.00')}</span>
                    </td>
                  </tr>
                  <tr class="add">
                    <td></td>
                    <td colspan="3">
                      <span ?hidden="${pdOutput.inEditMode}"
                        ><paper-icon-button icon="add-box"></paper-icon-button> Add New Activity</span
                      >
                    </td>
                    <td colspan="3"></td>
                    <td class="h-center">
                      <div class="flex-h justify-right" ?hidden="${!pdOutput.inEditMode}">
                        <paper-button @click="${() => this.savePdOutput(pdOutput)}">Save</paper-button>
                        <paper-icon-button
                          icon="close"
                          @click="${() => this.cancelPdOutput(result.ll_results, pdOutput, resultIndex, pdOutputIndex)}"
                        ></paper-icon-button>
                      </div>
                    </td>
                  </tr>
                </tbody>

                ${pdOutput.activities?.map(
                  (activity: InterventionActivity) => html`
                    <thead>
                      <tr class="edit">
                        <td class="first-col"></td>
                        <td colspan="3"></td>
                        <td class="col-g"></td>
                        <td class="col-g"></td>
                        <td class="col-g"></td>
                        <td class="col-6">
                          <paper-icon-button
                            icon="create"
                            ?hidden="${activity.inEditMode}"
                            @click="${() => {
                              activity.inEditMode = true;
                              this.requestUpdate();
                            }}"
                          ></paper-icon-button>
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
                        <td colspan="3">
                          <paper-textarea
                            no-label-float
                            .value="${activity.name}"
                            ?readonly="${!activity.inEditMode}"
                          ></paper-textarea>
                          <div class="pad-top-8">
                            <paper-textarea
                              placeholder="-"
                              label="Other Notes"
                              always-float-label
                              ?readonly="${!activity.inEditMode}"
                              .value="${activity.context_details}"
                            ></paper-textarea>
                          </div>
                        </td>
                        <td></td>
                        <td>
                          <etools-currency-amount-input
                            no-label-float
                            .value="${activity.cso_cash}"
                            ?readonly="${!activity.inEditMode}"
                          ></etools-currency-amount-input>
                        </td>
                        <td>
                          <etools-currency-amount-input
                            no-label-float
                            .value="${activity.unicef_cash}"
                            ?readonly="${!activity.inEditMode}"
                          ></etools-currency-amount-input>
                        </td>
                        <td>
                          ${this.intervention.planned_budget.currency}
                          <span class="b"
                            >${displayCurrencyAmount(
                              String(this.getTotal(activity.cso_cash, activity.unicef_cash)),
                              '0',
                              2
                            )}
                          </span>
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
                              <etools-currency-amount-input
                                no-label-float
                                .value="${item.no_units}"
                              ></etools-currency-amount-input>
                            </td>
                            <td>
                              <etools-currency-amount-input
                                no-label-float.value="${item.unit_price}"
                              ></etools-currency-amount-input>
                            </td>
                            <td>
                              <etools-currency-amount-input
                                no-label-float.value="${item.cso_cash}"
                              ></etools-currency-amount-input>
                            </td>
                            <td>
                              <etools-currency-amount-input
                                no-label-float
                                .value="${item.unicef_cash}"
                              ></etools-currency-amount-input>
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
  originalResultLink: ExpectedResult[] = [];

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

  private prevInterventionId: number | null = null;

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(state.app?.routeDetails, 'interventions', TABS.WorkplanEditor)) {
      this.prevInterventionId = null;
      return;
    }
    if (!selectInterventionId(state)) {
      return;
    }
    this.resultLinks = selectInterventionResultLinks(state);
    this.originalResultLink = cloneDeep(this.resultLinks);
    if (this.prevInterventionId != selectInterventionId(state)) {
      // request
    }

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

  addNewPDOutput(llResults: Partial<ResultLinkLowerResult>[]) {
    llResults.unshift({name: '', total: '0', inEditMode: true});
    this.requestUpdate();
  }

  savePdOutput(pdOutput: ResultLinkLowerResult) {
    if (!this.validatePdOutput(pdOutput)) {
      pdOutput.invalid = true;
      this.requestUpdate();
      return;
    }

    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: this.localName
    });

    const endpoint: EtoolsRequestEndpoint = pdOutput.id
      ? getEndpoint(interventionEndpoints.pdDetails, {pd_id: pdOutput.id, intervention_id: this.interventionId})
      : getEndpoint(interventionEndpoints.createPd, {intervention_id: this.interventionId});

    sendRequest({
      endpoint,
      method: pdOutput.id ? 'PATCH' : 'POST',
      body: pdOutput.id ? {id: pdOutput.id, name: pdOutput.name} : {name: pdOutput.name}
    })
      .then((response) => getStore().dispatch(updateCurrentIntervention(response.intervention)))
      .then(() => {
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch((error: any) => {
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      })
      .finally(() =>
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: this.localName
        })
      );
  }

  validatePdOutput(pdOutput: ResultLinkLowerResult) {
    if (!pdOutput.name) {
      return false;
    }
    return true;
  }

  cancelPdOutput(
    llResults: Partial<ResultLinkLowerResult>[],
    pdOutput: ResultLinkLowerResult,
    resultIndex: number,
    pdOutputIndex: number
  ) {
    if (!pdOutput.id) {
      llResults.shift();
    } else {
      pdOutput.name = this.originalResultLink[resultIndex].ll_results[pdOutputIndex].name;
    }
    pdOutput.invalid = false;
    pdOutput.inEditMode = false;

    this.requestUpdate();
  }
}
