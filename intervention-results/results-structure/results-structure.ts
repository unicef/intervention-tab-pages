import {getStore} from '../../utils/redux-store-access';
import {css, html, CSSResultArray, customElement, LitElement, property} from 'lit-element';
import {repeat} from 'lit-html/directives/repeat';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import {
  selectInterventionId,
  selectInterventionStatus,
  selectInterventionQuarters,
  selectInterventionResultLinks,
  selectResultLinksPermissions
} from './results-structure.selectors';
import {ResultStructureStyles} from './results-structure.styles';
import '@unicef-polymer/etools-data-table';
import '@unicef-polymer/etools-content-panel';
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@polymer/paper-icon-button/paper-icon-button';
import './cp-output-level';
import './pd-indicators';
import './pd-activities';
import './modals/pd-output-dialog';
import './modals/cp-output-dialog';
import '@polymer/paper-item';
import '@polymer/paper-listbox';
import {getEndpoint} from '../../utils/endpoint-helper';
import {RootState} from '../../common/types/store.types';
import {openDialog} from '../../utils/dialog';
import CONSTANTS from '../../common/constants';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {callClickOnSpacePush, callClickOnEnterPush, pageIsNotCurrentlyActive} from '../../utils/common-methods';
import '../../common/layout/are-you-sure';
import get from 'lodash-es/get';
import {getIntervention, updateCurrentIntervention} from '../../common/actions/interventions';
import {_sendRequest} from '../../utils/request-helper';
import {isUnicefUser, currentIntervention} from '../../common/selectors';
import cloneDeep from 'lodash-es/cloneDeep';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import ContentPanelMixin from '../../common/mixins/content-panel-mixin';
import {CommentElementMeta, CommentsMixin} from '../../common/components/comments/comments-mixin';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {
  AsyncAction,
  InterventionQuarter,
  CpOutput,
  IdAndName,
  ExpectedResult,
  Intervention,
  ResultLinkLowerResult
} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

const RESULT_VIEW = 'result_view';
const BUDGET_VIEW = 'budget_view';
const COMBINED_VIEW = 'combined_view';

/**
 * @customElement
 */
@customElement('results-structure')
export class ResultsStructure extends CommentsMixin(ContentPanelMixin(LitElement)) {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      ResultStructureStyles,
      buttonsStyles,
      css`
        etools-content-panel::part(ecp-header) {
          z-index: 1;
        }

        iron-icon[icon='create'] {
          margin-left: 50px;
        }
        #view-menu-button {
          display: none;
          height: 28px;
        }
        #view-menu-button paper-button {
          height: 28px;
          background: var(--secondary-background-color);
          padding-right: 0;
        }
        #view-menu-button paper-button iron-icon {
          margin: 0 7px;
        }
        .view-toggle-button {
          display: flex;
          height: 28px;
          margin-left: 4px;
          padding: 0 19px;
          font-weight: 500;
          font-size: 14px;
          border-radius: 50px;
          background-color: #d0d0d0;
          color: #fff;
          cursor: pointer;
        }
        .view-toggle-button[active] {
          background-color: #009688;
        }
        .no-results {
          padding: 24px;
        }
        .pdOtputMargin {
          margin: 0 4px;
        }
        .pdOtputMargin.unicef-user .editable-row .hover-block {
          background-color: rgb(240, 240, 240);
        }
        .pdOtputMargin.partner .editable-row .hover-block {
          background-color: rgb(240, 240, 240);
        }
        #showInactive {
          margin-right: 8px;
        }
        @media (max-width: 1100px) {
          #view-menu-button {
            display: block;
          }
          .view-toggle-button {
            display: none;
          }
        }
      `
    ];
  }
  get viewType(): string {
    if (this.showActivities && this.showIndicators) {
      return COMBINED_VIEW;
    } else if (this.showActivities) {
      return BUDGET_VIEW;
    } else {
      return RESULT_VIEW;
    }
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
  @property({type: Boolean}) showIndicators = true;
  @property({type: Boolean}) showActivities = true;
  @property({type: Object})
  permissions!: {
    edit: {result_links?: boolean};
    required: {result_links?: boolean};
  };

  @property() private _resultLinks: ExpectedResult[] | null = [];
  @property({type: String}) noOfPdOutputs: string | number = '0';
  @property({type: Boolean}) thereAreInactiveIndicators = false;
  @property({type: Boolean}) showInactiveIndicators = false;

  private intervention!: Intervention;

  viewTabs = [
    {
      name: translate('INTERVENTION_RESULTS.RESULT_VIEW'),
      type: RESULT_VIEW,
      showIndicators: true,
      showActivities: false
    },
    {
      name: translate('INTERVENTION_RESULTS.COMBINED_VIEW'),
      type: COMBINED_VIEW,
      showIndicators: true,
      showActivities: true
    },
    {
      name: translate('INTERVENTION_RESULTS.BUDGET_VIEW'),
      type: BUDGET_VIEW,
      showIndicators: false,
      showActivities: true
    }
  ];

  private cpOutputs: CpOutput[] = [];

  render() {
    if (!this.intervention || !this.permissions || !this.resultLinks) {
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

        etools-data-table-row::part(edt-list-row-wrapper) {
          padding: 0 12px 0 0;
          background-color: var(--secondary-background-color);
          min-height: 48px;
          border-bottom: 1px solid var(--main-border-color) !important;
        }

        etools-data-table-row::part(edt-list-row-collapse-wrapper) {
          padding: 0 !important;
          border-bottom: none !important;
        }

        .export-res-btn {
          height: 28px;
        }
        .separator {
          border-left: solid 1px var(--dark-divider-color);
          height: 28px;
          padding-right: 10px;
          margin: 6px 0 6px 10px;
        }

        etools-content-panel::part(ecp-header) {
          position: relative;
          z-index: 1000;
          border-bottom: 1px groove var(--dark-divider-color);
        }

        .add-cp {
          opacity: 0.84;
          margin-left: 6px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title="${translate(
          'INTERVENTION_RESULTS.RESULTS_STRUCTURE.RESULTS_STRUCTURE'
        )} (${this.noOfPdOutputs})"
      >
        <div slot="panel-btns" class="layout-horizontal align-items-center">
          <paper-button
            title=${translate('INTERVENTION_RESULTS.EXPORT_RESULTS')}
            class="primary export-res-btn"
            ?hidden="${!this.showExportResults(this.interventionStatus, this.resultLinks)}"
            @click="${this.exportExpectedResults}"
          >
            ${translate('INTERVENTION_RESULTS.EXPORT')}
          </paper-button>
          <div
            class="separator"
            ?hidden="${!this.showSeparator(
              this.interventionStatus,
              this.resultLinks,
              this.permissions.edit.result_links
            )}"
          ></div>

          <paper-toggle-button
            id="showInactive"
            ?hidden="${!this.thereAreInactiveIndicators}"
            ?checked="${this.showInactiveIndicators}"
            @iron-change=${this.inactiveChange}
          >
            ${translate('INTERVENTION_RESULTS.SHOW_INACTIVE')}
          </paper-toggle-button>

          <paper-menu-button id="view-menu-button" close-on-activate horizontal-align="right">
            <paper-button slot="dropdown-trigger" class="dropdown-trigger">
              ${translate('INTERVENTION_RESULTS.VIEW')}
              <iron-icon icon="expand-more"></iron-icon>
            </paper-button>
            <paper-listbox slot="dropdown-content" attr-for-selected="name" .selected="${this.viewType}">
              ${this.viewTabs.map(
                (tab) =>
                  html` <paper-item
                    @click="${() => this.updateTableView(tab.showIndicators, tab.showActivities)}"
                    name="${tab.type}"
                  >
                    ${tab.name}
                  </paper-item>`
              )}
            </paper-listbox>
          </paper-menu-button>
          ${this.viewTabs.map(
            (tab) => html`
              <div
                class="view-toggle-button layout-horizontal align-items-center"
                ?active="${tab.type === this.viewType}"
                tabindex="0"
                id="clickable"
                @click="${() => this.updateTableView(tab.showIndicators, tab.showActivities)}"
              >
                ${tab.name}
              </div>
            `
          )}
          <paper-icon-button
            class="add-cp"
            icon="add-box"
            tabindex="0"
            ?hidden="${!this.isUnicefUser || !this.permissions.edit.result_links || this.commentMode}"
            @click="${() => this.openCpOutputDialog()}"
          ></paper-icon-button>
        </div>
        ${repeat(
          this.resultLinks,
          (result: ExpectedResult) => result.id,
          (result, _index) => html`
            <cp-output-level
              ?show-cpo-level="${this.isUnicefUser}"
              .resultLink="${result}"
              .interventionId="${this.interventionId}"
              .showIndicators="${this.showIndicators}"
              .showActivities="${this.showActivities}"
              .currency="${this.intervention.planned_budget.currency}"
              .readonly="${!this.permissions.edit.result_links || this.commentMode}"
              @add-pd="${() => this.openPdOutputDialog({}, result.cp_output)}"
              @edit-cp-output="${() => this.openCpOutputDialog(result)}"
              @delete-cp-output="${() => this.openDeleteCpOutputDialog(result.id)}"
            >
              ${result.ll_results.map(
                (pdOutput: ResultLinkLowerResult) => html`
                  <etools-data-table-row
                    details-opened
                    class="pdOtputMargin ${this.isUnicefUser ? 'unicef-user' : 'partner'}"
                    related-to="pd-output-${pdOutput.id}"
                    related-to-description=" PD Output - ${pdOutput.name}"
                    comments-container
                  >
                    <div slot="row-data" class="layout-horizontal align-items-center editable-row higher-slot">
                      <div class="flex-1 flex-fix">
                        <div class="heading">${translate('INTERVENTION_RESULTS.PROGRAM_DOCUMENT_OUTPUT')}</div>
                        <div class="data bold-data">${pdOutput.name}</div>
                      </div>

                      <div class="flex-none" ?hidden="${!this.showActivities}">
                        <div class="heading">${translate('INTERVENTION_RESULTS.TOTAL_CASH_BUDGET')}</div>
                        <div class="data">
                          ${this.intervention.planned_budget.currency} ${displayCurrencyAmount(pdOutput.total, '0.00')}
                        </div>
                      </div>

                      <div class="hover-block">
                        <paper-icon-button
                          icon="icons:create"
                          ?hidden="${!this.permissions.edit.result_links}"
                          @click="${() => this.openPdOutputDialog(pdOutput, result.cp_output)}"
                        ></paper-icon-button>
                        <paper-icon-button
                          icon="icons:delete"
                          ?hidden="${!this.permissions.edit.result_links}"
                          @click="${() => this.openDeletePdOutputDialog(pdOutput.id)}"
                        ></paper-icon-button>
                      </div>
                    </div>

                    <div slot="row-data-details">
                      <pd-indicators
                        ?hidden="${!this.showIndicators}"
                        .indicators="${pdOutput.applied_indicators}"
                        .pdOutputId="${pdOutput.id}"
                        .readonly="${!this.permissions.edit.result_links || this.commentMode}"
                        .showInactiveIndicators="${this.showInactiveIndicators}"
                      ></pd-indicators>
                      <pd-activities
                        .activities="${pdOutput.activities}"
                        .interventionId="${this.interventionId}"
                        .pdOutputId="${pdOutput.id}"
                        .quarters="${this.quarters}"
                        ?hidden="${!this.showActivities}"
                        .readonly="${!this.permissions.edit.result_links || this.commentMode}"
                      ></pd-activities>
                    </div>
                  </etools-data-table-row>
                `
              )}
            </cp-output-level>
          `
        )}
        ${!this.resultLinks.length
          ? html` <div class="no-results">${translate('INTERVENTION_RESULTS.NO_RESULTS_ADDED')}</div> `
          : ''}

        <div
          ?hidden="${this.isUnicefUser || this.commentMode || !this.permissions.edit.result_links}"
          class="add-pd white row-h align-items-center"
          @click="${() => this.openPdOutputDialog()}"
        >
          <paper-icon-button icon="add-box"></paper-icon-button>${translate('INTERVENTION_RESULTS.ADD_PD_OUTPUT')}
        </div>
      </etools-content-panel>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  firstUpdated(): void {
    super.firstUpdated();

    this.shadowRoot!.querySelectorAll('#view-toggle-button, .add-cp, iron-icon').forEach((el) =>
      callClickOnSpacePush(el)
    );
    this.shadowRoot!.querySelectorAll('#clickable').forEach((el) => callClickOnEnterPush(el));
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'results')) {
      return;
    }
    this.resultLinks = selectInterventionResultLinks(state);
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

  getSpecialElements(container: HTMLElement): CommentElementMeta[] {
    const element: HTMLElement = container.shadowRoot!.querySelector('#wrapper') as HTMLElement;
    const relatedTo: string = container.getAttribute('related-to') as string;
    const relatedToDescription = container.getAttribute('related-to-description') as string;
    return [{element, relatedTo, relatedToDescription}];
  }

  updateTableView(indicators: boolean, activities: boolean): void {
    this.showIndicators = indicators;
    this.showActivities = activities;
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
        content: translate('INTERVENTION_RESULTS.REMOVE_PD_MSG'),
        confirmBtnText: translate('INTERVENTION_RESULTS.CONFIRM_BTN_TXT')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deletePDOutputFromPD(lower_result_id);
    }
  }

  deletePDOutputFromPD(lower_result_id: number) {
    const endpoint = getEndpoint(interventionEndpoints.lowerResultsDelete, {
      lower_result_id,
      intervention_id: this.interventionId
    });
    _sendRequest({
      method: 'DELETE',
      endpoint: endpoint
    }).then(() => {
      getStore().dispatch<AsyncAction>(getIntervention());
    });
  }

  openCpOutputDialog(resultLink?: ExpectedResult): void {
    openDialog({
      dialog: 'cp-output-dialog',
      dialogData: {
        resultLink,
        cpOutputs: this.filterOutAlreadySelectedAndByCPStructure(),
        interventionId: this.interventionId
      }
    });
    this.openContentPanel();
  }

  filterOutAlreadySelectedAndByCPStructure() {
    const alreadyUsedCpOs = new Set(this.resultLinks.map(({cp_output}: ExpectedResult) => cp_output));
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
        content: translate('INTERVENTION_RESULTS.REMOVE_CP_OUTPUT_MSG'),
        confirmBtnText: translate('INTERVENTION_RESULTS.CONFIRM_BTN_TXT')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deleteCPOutputFromPD(resultLinkId);
    }
  }

  deleteCPOutputFromPD(resultLinkId: number) {
    const endpoint = getEndpoint(interventionEndpoints.resultLinkGetDelete, {
      result_link: resultLinkId
    });
    _sendRequest({
      method: 'DELETE',
      endpoint: endpoint
    }).then(() => {
      getStore().dispatch(updateCurrentIntervention(this.removeDeletedCPOutput(this.intervention, resultLinkId)));
    });
  }

  removeDeletedCPOutput(intervention: Intervention, resultLinkId: string | number) {
    intervention.result_links = intervention.result_links.filter(
      (rl: ExpectedResult) => rl.id !== Number(resultLinkId)
    );
    return intervention;
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

  showExportResults(status: string, resultLinks: ExpectedResult[]) {
    return (
      [
        CONSTANTS.STATUSES.Draft.toLowerCase(),
        CONSTANTS.STATUSES.Signed.toLowerCase(),
        CONSTANTS.STATUSES.Active.toLowerCase()
      ].indexOf(status) > -1 &&
      resultLinks &&
      resultLinks.length
    );
  }

  showSeparator(status: string, resultLinks: ExpectedResult[], resultLinkPermission: boolean | undefined) {
    return this.showExportResults(status, resultLinks) && resultLinkPermission;
  }

  exportExpectedResults() {
    const endpoint = getEndpoint(interventionEndpoints.expectedResultsExport, {
      intervention_id: this.interventionId
    }).url;
    window.open(endpoint, '_blank');
  }

  inactiveChange(e: CustomEvent): void {
    if (!e.detail) {
      return;
    }
    const element = e.currentTarget as HTMLInputElement;
    if (this.showInactiveIndicators !== element.checked) {
      this.showInactiveIndicators = element.checked;
      this.requestUpdate();
    }
  }
}
