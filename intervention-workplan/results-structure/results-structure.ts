import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {css, html, CSSResultArray, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

import {
  selectInterventionId,
  selectInterventionStatus,
  selectInterventionQuarters,
  selectInterventionResultLinks,
  selectResultLinksPermissions
} from './results-structure.selectors';
import {ResultStructureStyles} from './styles/results-structure.styles';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import './cp-output-level';
import './pd-indicators';
import './pd-activities';
import './modals/pd-output-dialog';
import './modals/cp-output-dialog';
import './display-controls';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {RootState} from '../../common/types/store.types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {TABS} from '../../common/constants';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import get from 'lodash-es/get';
import {getIntervention} from '../../common/actions/interventions';
import {isUnicefUser, currentIntervention} from '../../common/selectors';
import cloneDeep from 'lodash-es/cloneDeep';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {CommentElementMeta, CommentsMixin} from '../../common/components/comments/comments-mixin';
import {displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';
import {
  AsyncAction,
  InterventionQuarter,
  CpOutput,
  IdAndName,
  ExpectedResult,
  Intervention,
  ResultLinkLowerResult,
  Indicator,
  EtoolsEndpoint
} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import ContentPanelMixin from '@unicef-polymer/etools-modules-common/dist/mixins/content-panel-mixin';
import {_sendRequest} from '@unicef-polymer/etools-modules-common/dist/utils/request-helper';
import {EtoolsDataTableRow} from '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table-row';
import {PdActivities} from './pd-activities';
import {PdIndicators} from './pd-indicators';
import {CpOutputLevel} from './cp-output-level';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {_canDelete} from '../../common/mixins/results-structure-common';
import {RequestEndpoint} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

/**
 * @customElement
 */
@customElement('results-structure')
export class ResultsStructure extends CommentsMixin(ContentPanelMixin(LitElement)) {
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
  @property({type: Boolean}) showIndicators = true;
  @property({type: Boolean}) showActivities = true;
  @property({type: Boolean}) showInactiveToggle = false;
  @property({type: Object})
  permissions!: {
    edit: {result_links?: boolean};
    required: {result_links?: boolean};
  };

  @property() private _resultLinks: ExpectedResult[] | null = null;
  @property({type: String}) noOfPdOutputs: string | number = '0';
  @property({type: Boolean}) thereAreInactiveIndicators = false;
  @property({type: Boolean}) showInactiveIndicatorsActivities = false;

  @property({type: Object})
  intervention!: Intervention;

  private cpOutputs: CpOutput[] = [];
  private newCPOutputs: Set<number> = new Set();
  private newPDOutputs: Set<number> = new Set();
  private commentsModeEnabledFlag?: boolean;

  render() {
    if (!this.intervention || !this.permissions || !this.resultLinks) {
      return html` ${sharedStyles}
        <etools-loading source="results-s" active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        etools-content-panel::part(ecp-header-title-panel) {
          justify-content: space-between;
        }
      </style>
      <etools-content-panel
        show-expand-btn
        panel-title="${translate(translatesMap.result_links)} (${this.noOfPdOutputs})"
        elevation="0"
      >
        <div slot="after-title">
          <display-controls
            ?show-inactive-toggle="${this.showInactiveToggle}"
            .showIndicators="${this.showIndicators}"
            .showActivities="${this.showActivities}"
            .interventionId="${this.interventionId}"
            @show-inactive-changed="${this.inactiveChange}"
            @tab-view-changed="${this.updateTableView}"
          ></display-controls>
        </div>
        <div slot="panel-btns">
          <div class="total-result layout-horizontal bottom-aligned" ?hidden="${!this.showActivities}">
            <div class="heading">${translate('TOTAL')}:</div>
            <div class="data">${this.intervention.planned_budget.currency} <b>${this.getTotal()}</b></div>
          </div>
        </div>

        <!--    CP output ADD button     -->
        <div
          class="add-button"
          @click="${() => this.openCpOutputDialog()}"
          ?hidden="${!this.isUnicefUser || !this.permissions.edit.result_links || this.commentMode}"
        >
          <etools-icon-button name="add-box" tabindex="0"></etools-icon-button>
          <span class="no-wrap">${translate('ADD_CP_OUTPUT')}</span>
        </div>

        <!--    PD output ADD button for non Unicef users     -->
        <div
          class="pd-add-section"
          ?hidden="${this.isUnicefUser || !this.permissions.edit.result_links || this.commentMode}"
        >
          <div class="pd-title layout-horizontal align-items-center">
            ${translate('PD_OUTPUTS_TITLE')}
            <etools-info-tooltip position="top" custom-icon offset="0">
              <etools-icon-button
                name="add-box"
                slot="custom-icon"
                class="add"
                @click="${() => this.openPdOutputDialog()}"
              ></etools-icon-button>
              <span class="no-wrap" slot="message">${translate('ADD_PD_OUTPUT')}</span>
            </etools-info-tooltip>
          </div>
        </div>
        ${repeat(
          this.resultLinks,
          (result: ExpectedResult) => result.id,
          (result, _index) => html`
            <cp-output-level
              index="${_index}"
              ?show-cpo-level="${this.isUnicefUser}"
              .resultLink="${result}"
              .interventionId="${this.interventionId}"
              .showIndicators="${this.showIndicators}"
              .showActivities="${this.showActivities}"
              .currency="${this.intervention.planned_budget.currency}"
              .readonly="${!this.permissions.edit.result_links || this.commentMode}"
              .opened="${this.newCPOutputs.has(result.id)}"
              .interventionInfo="${this._getCPNeededInterventionInfo(this.intervention)}"
              @edit-cp-output="${() => this.openCpOutputDialog(result)}"
              @delete-cp-output="${() => this.openDeleteCpOutputDialog(result.id)}"
              @opened-changed="${this.onCpOpenedChanged}"
              style="z-index: ${99 - _index};"
            >
              <div
                class="no-results"
                ?hidden="${!this.isUnicefUser || this.permissions.edit.result_links || result.ll_results.length}"
              >
                ${translate('NO_PDS_ADDED')}
              </div>
              ${!this.isUnicefUser || !result.cp_output || !this.permissions.edit.result_links || this.commentMode
                ? ''
                : html`
                    <div class="pd-title layout-horizontal align-items-center">
                      ${translate('PD_OUTPUTS_TITLE')}<etools-info-tooltip position="top" custom-icon offset="0">
                        <etools-icon-button
                          name="add-box"
                          slot="custom-icon"
                          class="add"
                          @click="${() => this.openPdOutputDialog({}, result.cp_output)}"
                        ></etools-icon-button>
                        <span class="no-wrap" slot="message">${translate('ADD_PD_OUTPUT')}</span>
                      </etools-info-tooltip>
                    </div>
                  `}
              ${result.ll_results.map(
                (pdOutput: ResultLinkLowerResult, index: number) => html`
                  <etools-data-table-row
                    id="pdOutputRow"
                    class="pdOutputMargin ${this.isUnicefUser ? 'unicef-user' : 'partner'}"
                    related-to="pd-output-${pdOutput.id}"
                    related-to-description="${pdOutput.name}"
                    comments-container
                    secondary-bg-on-hover
                    .detailsOpened="${this.newPDOutputs.has(pdOutput.id)}"
                    style="z-index: ${99 - index};"
                  >
                    <div slot="row-data" class="layout-horizontal editable-row pd-output-row">
                      <div class="flex-fix">
                        <div class="data bold-data">${pdOutput.code}&nbsp;${pdOutput.name}</div>
                        <div class="count">
                          <div><b>${pdOutput.activities.length}</b> ${translate('ACTIVITIES')}</div>
                          <div><b>${pdOutput.applied_indicators.length}</b> ${translate('INDICATORS')}</div>
                        </div>
                      </div>

                      <div class="flex-none total-cache" ?hidden="${!this.showActivities}">
                        <div class="heading">${translate('TOTAL_CASH_BUDGET')}</div>
                        <div class="data">
                          <span class="currency">${this.intervention.planned_budget.currency}</span>
                          ${displayCurrencyAmount(pdOutput.total, '0.00')}
                        </div>
                      </div>

                      <div
                        class="hover-block"
                        ?hidden="${!this.permissions.edit.result_links || this.commentsModeEnabledFlag}"
                      >
                        <etools-icon-button
                          name="create"
                          @click="${() => this.openPdOutputDialog(pdOutput, result.cp_output)}"
                        ></etools-icon-button>
                        <etools-icon-button
                          name="delete"
                          ?hidden="${!_canDelete(
                            pdOutput,
                            !this.permissions.edit.result_links!,
                            this.intervention.status,
                            this.intervention.in_amendment,
                            this.intervention.in_amendment_date
                          )}"
                          @click="${() => this.openDeletePdOutputDialog(pdOutput.id)}"
                        ></etools-icon-button>
                      </div>
                    </div>

                    <div slot="row-data-details">
                      <pd-activities
                        .activities="${pdOutput.activities}"
                        .interventionId="${this.interventionId}"
                        .interventionStatus="${this.interventionStatus}"
                        .inAmendmentDate="${this.intervention.in_amendment_date}"
                        .showInactive="${this.showInactiveIndicatorsActivities}"
                        .pdOutputId="${pdOutput.id}"
                        .quarters="${this.quarters}"
                        ?hidden="${!this.showActivities}"
                        .readonly="${!this.permissions.edit.result_links || this.commentMode}"
                        .currency="${this.intervention.planned_budget.currency}"
                        .inAmendment="${this.intervention.in_amendment}"
                      ></pd-activities>
                      <pd-indicators
                        ?hidden="${!this.showIndicators}"
                        .indicators="${pdOutput.applied_indicators}"
                        .pdOutputId="${pdOutput.id}"
                        .readonly="${!this.permissions.edit.result_links || this.commentMode}"
                        .showInactiveIndicators="${this.showInactiveIndicatorsActivities}"
                        .inAmendment="${this.intervention.in_amendment}"
                        .inAmendmentDate="${this.intervention.in_amendment_date}"
                      ></pd-indicators>
                    </div>
                  </etools-data-table-row>
                `
              )}
            </cp-output-level>
          `
        )}
        ${!this.resultLinks.length ? html` <div class="no-results">${translate('NO_RESULTS_ADDED')}</div> ` : ''}
      </etools-content-panel>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  protected firstUpdated(changedProperties: any) {
    super.firstUpdated(changedProperties);
    if (this.commentsModeEnabledFlag) {
      setTimeout(() => this.openAllCpOutputs());
    }
  }

  onCpOpenedChanged(event: CustomEvent) {
    if (!event.detail.opened) {
      return;
    }
    this.openCPChildren(event.target as CpOutputLevel);
  }

  openAllCpOutputs() {
    this.shadowRoot!.querySelectorAll('cp-output-level').forEach((element) => {
      const row = (element as CpOutputLevel).shadowRoot!.querySelector('etools-data-table-row');
      if (row) {
        (row as EtoolsDataTableRow).detailsOpened = true;
      }
      this.openCPChildren(element as CpOutputLevel);
    });
  }

  openCPChildren(cpElement: CpOutputLevel): void {
    cpElement
      .querySelectorAll('etools-data-table-row')
      .forEach((row: Element) => ((row as EtoolsDataTableRow).detailsOpened = true));
    cpElement
      .querySelectorAll('pd-activities, pd-indicators')
      .forEach((row: Element) => (row as PdActivities | PdIndicators).openAllRows());
  }

  stateChanged(state: RootState) {
    if (
      EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Workplan) ||
      !state.interventions.current
    ) {
      return;
    }
    if (state.commentsData?.commentsModeEnabled && !this.commentsModeEnabledFlag) {
      this.openAllCpOutputs();
    }
    this.commentsModeEnabledFlag = Boolean(state.commentsData?.commentsModeEnabled);
    this.updateResultLinks(state);
    this.showInactiveToggle = this.resultLinks.some(({ll_results}: ExpectedResult) =>
      ll_results.some(
        ({applied_indicators, activities}: ResultLinkLowerResult) =>
          applied_indicators.some(({is_active}: Indicator) => !is_active) || activities.some((a) => !a.is_active)
      )
    );
    this.permissions = selectResultLinksPermissions(state);
    this.interventionId = selectInterventionId(state);
    this.interventionStatus = selectInterventionStatus(state);
    this.quarters = selectInterventionQuarters(state);
    this.cpOutputs = (state.commonData && state.commonData.cpOutputs) || [];
    this.isUnicefUser = isUnicefUser(state);
    this.intervention = cloneDeep(currentIntervention(state));
    this._updateNoOfPdOutputs();
    super.stateChanged(state);
  }

  getTotal(): string {
    const total: number = this.resultLinks.reduce(
      (sum: number, result: ExpectedResult) => sum + Number(result.total),
      0
    );
    return displayCurrencyAmount(String(total), '0.00');
  }

  getSpecialElements(container: HTMLElement): CommentElementMeta[] {
    const element: HTMLElement = container.shadowRoot!.querySelector('#wrapper') as HTMLElement;
    const relatedTo: string = container.getAttribute('related-to') as string;
    const relatedToDescription = container.getAttribute('related-to-description') as string;
    return [{element, relatedTo, relatedToDescription}];
  }

  updateTableView({detail}: CustomEvent): void {
    this.showIndicators = detail.showIndicators;
    this.showActivities = detail.showActivities;
  }

  openPdOutputDialog(): void;
  openPdOutputDialog(pdOutput: Partial<ResultLinkLowerResult>, cpOutput: number): void;
  openPdOutputDialog(pdOutput?: Partial<ResultLinkLowerResult>, cpOutput?: number): void {
    const cpOutputs: IdAndName<number>[] = this.intervention.result_links
      .map(({cp_output: id, cp_output_name: name}: ExpectedResult) => ({
        id,
        name
      }))
      .filter(({id}: IdAndName<number>) => id);
    openDialog<any>({
      dialog: 'pd-output-dialog',
      dialogData: {
        pdOutput: pdOutput ? {...pdOutput, cp_output: cpOutput} : undefined,
        cpOutputs,
        hideCpOutputs: !this.isUnicefUser,
        interventionId: this.interventionId
      }
    });
  }

  async openDeletePdOutputDialog(lower_result_id: number) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: translate('REMOVE_PD_MSG'),
        confirmBtnText: translate('CONFIRM_BTN_TXT')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deletePDOutputFromPD(lower_result_id);
    }
  }

  deletePDOutputFromPD(lower_result_id: number) {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'interv-pd-remove'
    });
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.lowerResultsDelete, {
      lower_result_id,
      intervention_id: this.interventionId
    });
    _sendRequest({
      method: 'DELETE',
      endpoint: endpoint
    })
      .then(() => getStore().dispatch<AsyncAction>(getIntervention()))
      .finally(() =>
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'interv-pd-remove'
        })
      );
  }

  openCpOutputDialog(resultLink?: ExpectedResult): void {
    const canChangeCpOp =
      !this.intervention.in_amendment && ['draft', 'development'].includes(this.intervention.status);
    openDialog({
      dialog: 'cp-output-dialog',
      dialogData: {
        resultLink,
        cpOutputs: this.filterOutAlreadySelectedAndByCPStructure(canChangeCpOp),
        interventionId: this.interventionId,
        canChangeCpOp: canChangeCpOp
      }
    });
    this.openContentPanel();
  }

  filterOutAlreadySelectedAndByCPStructure(canChangeCpOp: boolean) {
    const alreadyUsedCpOs = canChangeCpOp
      ? new Set()
      : new Set(this.resultLinks.map(({cp_output}: ExpectedResult) => cp_output));
    const cpStructures = this.intervention.country_programmes?.map((c: string) => Number(c));

    return this.cpOutputs.filter(({id, country_programme}: CpOutput) => {
      let conditionFulfilled = !alreadyUsedCpOs.has(id);
      if (cpStructures && cpStructures.length) {
        conditionFulfilled = conditionFulfilled && cpStructures.includes(Number(country_programme));
      }
      return conditionFulfilled;
    });
  }

  async openDeleteCpOutputDialog(resultLinkId: number) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: translate('REMOVE_CP_OUTPUT_MSG'),
        confirmBtnText: translate('CONFIRM_BTN_TXT')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deleteCPOutputFromPD(resultLinkId);
    }
  }

  deleteCPOutputFromPD(resultLinkId: number) {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'interv-cp-remove'
    });
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.resultLinkGetDelete, {
      result_link: resultLinkId
    });
    _sendRequest({
      method: 'DELETE',
      endpoint: endpoint
    })
      .then(() => getStore().dispatch<AsyncAction>(getIntervention()))
      .finally(() =>
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'interv-cp-remove'
        })
      );
  }

  _updateNoOfPdOutputs() {
    if (!this.resultLinks) {
      this.noOfPdOutputs = 0;
      this.thereAreInactiveIndicators = false;
      return;
    }
    this.noOfPdOutputs = this.resultLinks
      .map((rl: ExpectedResult) => {
        return rl.ll_results.length;
      })
      .reduce((a: number, b: number) => a + b, 0);

    if (!this.noOfPdOutputs) {
      this.thereAreInactiveIndicators = false;
    } else {
      this.thereAreInactiveIndicators = !!this._getNoOfInactiveIndicators();
    }
  }

  _getNoOfInactiveIndicators() {
    return this.resultLinks
      .map((rl: ExpectedResult) => {
        return rl.ll_results
          .map((llr) => {
            return llr.applied_indicators.filter((i) => !i.is_active).length;
          })
          .reduce((a: number, b: number) => a + b, 0);
      })
      .reduce((a: number, b: number) => a + b, 0);
  }

  inactiveChange(e: CustomEvent): void {
    if (!e.detail) {
      return;
    }
    this.showInactiveIndicatorsActivities = e.detail.value;
  }

  private updateResultLinks(state: RootState): void {
    const newResults = selectInterventionResultLinks(state) || [];
    if (this._resultLinks) {
      // check if CP outputs was rendered already, check if we have new CP output.
      const existingCP = this.resultLinks.map(({id}) => id);
      const created = newResults.filter(({id}) => !existingCP.includes(id));
      // if we found new CP output - add it to track to open it on first render
      created.forEach(({id}) => this.newCPOutputs.add(id));
      // the same thing for PD
      const existingPD = this.resultLinks.flatMap(({ll_results}) => ll_results.map(({id}) => id));
      const createdPD = newResults.flatMap(({ll_results}) => ll_results).filter(({id}) => !existingPD.includes(id));
      createdPD.forEach(({id}) => this.newPDOutputs.add(id));
    }

    this.resultLinks = newResults;
  }

  _getCPNeededInterventionInfo(intervention: Intervention) {
    return {
      status: intervention.status,
      in_amendment: intervention.in_amendment,
      in_amendment_date: intervention.in_amendment_date
    };
  }

  static get styles(): CSSResultArray {
    // language=CSS
    return [
      layoutStyles,
      ResultStructureStyles,
      css`
        etools-icon[name='create'] {
          margin-inline-start: 50px;
        }
        .no-results {
          padding: 24px;
        }
        .pd-title {
          padding-block: 8px 0;
          padding-inline: 22px 42px;
          font-size: var(--etools-font-size-16, 16px);
          font-weight: 500;
          line-height: 19px;
        }
        cp-output-level .pd-title {
          padding: 8px 16px;
          padding-inline-start: 45px;
        }
        .pd-add-section {
          background-color: #ccebff;
        }
        .pd-add {
          padding: 0 5px 0;
        }
        etools-data-table-row {
          position: relative;
        }
        etools-data-table-row.partner:after,
        etools-data-table-row:not(:last-child):after {
          content: '';
          display: block;
          position: absolute;
          width: calc(100% - 14px);
          left: 7px;
          bottom: 0;
          height: 1px;
          background-color: #c4c4c4;
        }
        cp-output-level:last-child etools-data-table-row:last-child:after {
          content: none;
        }
        :host {
          display: block;
          margin-bottom: 24px;
        }

        etools-data-table-row::part(edt-list-row-wrapper) {
          background-color: #ccebff;
          min-height: 48px;
          border-bottom: none;
        }
        etools-data-table-row::part(edt-icon-wrapper) {
          min-height: 0;
          line-height: normal;
          padding-block: 4px 0;
          padding-inline: 13px 8px;
          align-self: flex-start;
        }
        etools-data-table-row::part(edt-list-row-wrapper):hover {
          background-color: var(--pd-output-background);
        }

        etools-data-table-row::part(edt-list-row-collapse-wrapper) {
          padding: 0 !important;
          border-bottom: none !important;
        }
        div.editable-row .hover-block {
          background: linear-gradient(270deg, var(--pd-output-background) 71.65%, rgba(196, 196, 196, 0) 100%);
        }
        div.pd-output-row > div {
          line-height: 26px;
          padding-top: 6px;
          padding-bottom: 4px;
        }
        .export-res-btn {
          height: 28px;
        }
        .no-wrap {
          white-space: nowrap;
        }
        .total-result {
          padding-bottom: 6px;
          margin-inline-start: 12px;
        }
        .total-result b {
          font-size: var(--etools-font-size-22, 22px);
          font-weight: 900;
          line-height: 23px;
        }
        .total-result .heading {
          font-size: var(--etools-font-size-14, 14px);
          margin-inline-end: 10px;
          line-height: 23px;
        }
        etools-content-panel {
          box-shadow: 0 2px 7px 3px rgba(0, 0, 0, 0.15);
        }
        etools-content-panel::part(ecp-header) {
          border-bottom: none;
        }
        etools-content-panel::part(ecp-header) {
          position: relative;
          padding: 13px 16px;
        }
        etools-content-panel::part(ecp-header):after {
          content: '';
          position: absolute;
          display: block;
          width: calc(100% - 14px);
          left: 7px;
          bottom: 0;
          height: 1px;
          background-color: #c4c4c4;
        }
        .count {
          display: flex;
          font-size: var(--etools-font-size-14, 14px);
          font-weight: 400;
          line-height: 16px;
          padding: 6px 0 4px;
        }
        .count div:first-child {
          margin-inline-end: 20px;
        }

        etools-data-table-row#pdOutputRow::part(edt-list-row-wrapper) {
          padding-inline-start: 25px !important;
        }
        .flex-fix {
          min-width: 0px;
          min-height: 0px;
          width: 100%;
        }
        @media (max-width: 768px) {
          .total-result b {
            font-size: var(--etools-font-size-18, 18px);
          }
        }
      `
    ];
  }
}
