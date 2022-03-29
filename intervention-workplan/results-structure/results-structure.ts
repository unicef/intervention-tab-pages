import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {css, html, CSSResultArray, customElement, LitElement, property} from 'lit-element';
import {repeat} from 'lit-html/directives/repeat';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {
  selectInterventionId,
  selectInterventionStatus,
  selectInterventionQuarters,
  selectInterventionResultLinks,
  selectResultLinksPermissions
} from './results-structure.selectors';
import {ResultStructureStyles} from './results-structure.styles';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-content-panel';
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import './cp-output-level';
import './pd-indicators';
import './pd-activities';
import './modals/pd-output-dialog';
import './modals/cp-output-dialog';
import '@polymer/paper-item';
import '@polymer/paper-listbox';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {RootState} from '../../common/types/store.types';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {TABS} from '../../common/constants';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {
  callClickOnSpacePushListener,
  callClickOnEnterPushListener,
  pageIsNotCurrentlyActive
} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import get from 'lodash-es/get';
import {getIntervention, updateCurrentIntervention} from '../../common/actions/interventions';
import {isUnicefUser, currentIntervention} from '../../common/selectors';
import cloneDeep from 'lodash-es/cloneDeep';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
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
import {translatesMap} from '../../utils/intervention-labels-map';
import ContentPanelMixin from '@unicef-polymer/etools-modules-common/dist/mixins/content-panel-mixin';
import {_sendRequest} from '@unicef-polymer/etools-modules-common/dist/utils/request-helper';
import {elevation1, elevation3} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';

const RESULT_VIEW = 'result_view';
const BUDGET_VIEW = 'budget_view';
const COMBINED_VIEW = 'combined_view';

/**
 * @customElement
 */
@customElement('results-structure')
export class ResultsStructure extends CommentsMixin(ContentPanelMixin(LitElement)) {
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
  @property({type: Boolean}) showActivities = false;
  @property({type: Object})
  permissions!: {
    edit: {result_links?: boolean};
    required: {result_links?: boolean};
  };

  @property() private _resultLinks: ExpectedResult[] | null = [];
  @property({type: String}) noOfPdOutputs: string | number = '0';
  @property({type: Boolean}) thereAreInactiveIndicators = false;
  @property({type: Boolean}) showInactiveIndicators = false;

  @property({type: Object})
  intervention!: Intervention;

  viewTabs = [
    {
      name: translate('RESULT_VIEW'),
      type: RESULT_VIEW,
      showIndicators: true,
      showActivities: false
    },
    {
      name: translate('COMBINED_VIEW'),
      type: COMBINED_VIEW,
      showIndicators: true,
      showActivities: true
    },
    {
      name: translate('BUDGET_VIEW'),
      type: BUDGET_VIEW,
      showIndicators: false,
      showActivities: true
    }
  ];

  private cpOutputs: CpOutput[] = [];

  render() {
    if (!this.intervention || !this.permissions || !this.resultLinks) {
      return html` ${sharedStyles}
        <etools-loading source="results-s" loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <etools-content-panel
        panel-title="${translate(translatesMap.result_links)} (${this.noOfPdOutputs})"
        elevation="0"
      >
        <div slot="panel-btns" class="layout-horizontal align-items-center">
          <paper-toggle-button
            id="showInactive"
            ?hidden="${!this.thereAreInactiveIndicators}"
            ?checked="${this.showInactiveIndicators}"
            @iron-change=${this.inactiveChange}
          >
            ${translate('SHOW_INACTIVE')}
          </paper-toggle-button>

          <paper-menu-button id="view-menu-button" close-on-activate horizontal-align="right">
            <paper-button slot="dropdown-trigger" class="dropdown-trigger">
              ${translate('VIEW')}
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
        </div>

        <!--    CP output ADD button     -->
        <div
          class="add-button"
          @click="${() => this.openCpOutputDialog()}"
          ?hidden="${!this.isUnicefUser || !this.permissions.edit.result_links || this.commentMode}"
        >
          <paper-icon-button slot="custom-icon" icon="add-box" tabindex="0"></paper-icon-button>
          <span class="no-wrap">${translate('ADD_CP_OUTPUT')}</span>
        </div>

        <!--    PD output ADD button for non Unicef users     -->
        <div
          class="pd-add-section"
          ?hidden="${this.isUnicefUser || !this.permissions.edit.result_links || this.commentMode}"
        >
          <div class="pd-title">Program Document Output(s)</div>
          <div class="add-button" @click="${() => this.openPdOutputDialog()}">
            <paper-icon-button slot="custom-icon" icon="add-box" tabindex="0"></paper-icon-button>
            <span class="no-wrap">${translate('ADD_PD_OUTPUT')}</span>
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
              @edit-cp-output="${() => this.openCpOutputDialog(result)}"
              @delete-cp-output="${() => this.openDeleteCpOutputDialog(result.id)}"
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
                    <div class="pd-title">Program Document Output(s)</div>
                    <div class="add-button pd-add" @click="${() => this.openPdOutputDialog({}, result.cp_output)}">
                      <paper-icon-button slot="custom-icon" icon="add-box" tabindex="0"></paper-icon-button>
                      <span class="no-wrap">${translate('ADD_PD_OUTPUT')}</span>
                    </div>
                  `}
              ${result.ll_results.map(
                (pdOutput: ResultLinkLowerResult) => html`
                  <etools-data-table-row
                    class="pdOutputMargin ${this.isUnicefUser ? 'unicef-user' : 'partner'}"
                    related-to="pd-output-${pdOutput.id}"
                    related-to-description=" PD Output - ${pdOutput.name}"
                    comments-container
                    secondary-bg-on-hover
                  >
                    <div slot="row-data" class="layout-horizontal align-items-center editable-row higher-slot">
                      <div class="flex-1 flex-fix">
                        <div class="data bold-data">${pdOutput.code}&nbsp;${pdOutput.name}</div>
                      </div>

                      <div class="flex-none total-cache" ?hidden="${!this.showActivities}">
                        <div class="heading">${translate('TOTAL_CASH_BUDGET')}</div>
                        <div class="data">
                          ${this.intervention.planned_budget.currency} ${displayCurrencyAmount(pdOutput.total, '0.00')}
                        </div>
                      </div>

                      <div class="hover-block" ?hidden="${!this.permissions.edit.result_links}">
                        <paper-icon-button
                          icon="icons:create"
                          @click="${() => this.openPdOutputDialog(pdOutput, result.cp_output)}"
                        ></paper-icon-button>
                        <paper-icon-button
                          icon="icons:delete"
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
                        .inAmendment="${this.intervention.in_amendment}"
                      ></pd-indicators>
                      <pd-activities
                        .activities="${pdOutput.activities}"
                        .interventionId="${this.interventionId}"
                        .pdOutputId="${pdOutput.id}"
                        .quarters="${this.quarters}"
                        ?hidden="${!this.showActivities}"
                        .readonly="${!this.permissions.edit.result_links || this.commentMode}"
                        .currency="${this.intervention.planned_budget.currency}"
                      ></pd-activities>
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

  firstUpdated(): void {
    super.firstUpdated();

    this.shadowRoot!.querySelectorAll('#view-toggle-button, .add-button paper-icon-button, iron-icon').forEach((el) =>
      callClickOnSpacePushListener(el)
    );
    this.shadowRoot!.querySelectorAll('#clickable').forEach((el) => callClickOnEnterPushListener(el));
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Workplan)) {
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

  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      ResultStructureStyles,
      buttonsStyles,
      css`
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
          color: rgb(3 114 102);
          cursor: pointer;
          ${elevation1};
        }
        .view-toggle-button[active] {
          background-color: #009688;
          color: #fff;
        }
        .view-toggle-button:focus {
          outline: 0;
          ${elevation3}
        }
        .no-results {
          padding: 24px;
        }
        .pdOutputMargin.unicef-user .editable-row .hover-block,
        .pdOutputMargin.partner .editable-row .hover-block {
          background: linear-gradient(270deg, #c4c4c4 71.65%, rgba(196, 196, 196, 0) 100%);
          padding-left: 20px;
        }
        #showInactive {
          margin-right: 8px;
        }
        .pd-title {
          padding: 32px 42px 0 22px;
          font-size: 16px;
          font-weight: 500;
          line-height: 19px;
        }
        cp-output-level .pd-title {
          padding: 32px 42px 0;
        }
        .pd-add-section {
          background-color: var(--secondary-background-color);
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
          --paper-tooltip-background: #818181;
        }

        etools-data-table-row::part(edt-list-row-wrapper) {
          padding: 0 12px 0 23px;
          background-color: var(--secondary-background-color);
          min-height: 48px;
          border-bottom: none;
        }
        etools-data-table-row::part(edt-list-row-wrapper):hover {
          background-color: #c4c4c4;
        }

        etools-data-table-row::part(edt-list-row-collapse-wrapper) {
          padding: 0 !important;
          border-bottom: none !important;
        }
        .export-res-btn {
          height: 28px;
        }
        .no-wrap {
          white-space: nowrap;
        }
        etools-content-panel {
          box-shadow: 0 2px 7px 3px rgba(0, 0, 0, 0.15);
        }
        etools-content-panel::part(ecp-header) {
          border-bottom: none;
        }
        etools-content-panel::part(ecp-header) {
          position: relative;
          height: 66px;
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
}
