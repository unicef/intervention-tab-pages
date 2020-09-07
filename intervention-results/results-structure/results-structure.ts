/* eslint-disable lit/no-legacy-template-syntax */
import {getStore} from '../../utils/redux-store-access';
import {css, html, CSSResultArray, customElement, LitElement, property} from 'lit-element';
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
import {
  CpOutput,
  ExpectedResult,
  InterventionQuarter,
  ResultLinkLowerResult
} from '../../common/models/intervention.types';
import '@unicef-polymer/etools-data-table';
import '@unicef-polymer/etools-content-panel';
import '@polymer/paper-toggle-button/paper-toggle-button';
import './cp-output-level';
import './pd-indicators';
import './pd-activities';
import './modals/pd-output-dialog';
import './modals/cp-output-dialog';
import '../../common/components/comments/comments-dialog';
import {getEndpoint} from '../../utils/endpoint-helper';
import {RootState} from '../../common/models/globals.types';
import {connect} from 'pwa-helpers/connect-mixin';
import {openDialog} from '../../utils/dialog';
import CONSTANTS from '../../common/constants';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';

/**
 * @customElement
 */
@customElement('results-structure')
export class ResultsStructure extends connect(getStore())(LitElement) {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      ResultStructureStyles,
      buttonsStyles,
      css`
        etools-content-panel {
          --ecp-content-padding: 0;
          --ecp-content_-_padding: 0;
        }
        iron-icon[icon='create'] {
          margin-left: 50px;
        }
        .view-toggle-button {
          height: 28px;
          margin-left: 40px;
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
      `
    ];
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
  permissions!: {edit: {result_links?: boolean}; required: {result_links?: boolean}};

  @property() private _resultLinks: ExpectedResult[] | null = [];
  @property({type: String}) noOfPdOutputs: string | number = '0';
  @property({type: Boolean}) thereAreInactiveIndicators = false;
  @property({type: Boolean}) showInactiveIndicators = false;

  private cpOutputs: CpOutput[] = [];

  render() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }
        etools-data-table-row {
          --list-row-wrapper-padding: 5px 12px 5px 0;
          --list-row-collapse-wrapper: {
            padding: 0 !important;
            border-bottom: 1px solid var(--main-border-color) !important;
          }
          --list-row-wrapper: {
            background-color: var(--secondary-background-color);
            min-height: 55px;
            border-bottom: 1px solid var(--main-border-color) !important;
          }
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
      </style>

      <etools-content-panel panel-title="Results Structure (${this.noOfPdOutputs})">
        <div slot="panel-btns" class="layout-horizontal align-items-center">
          <paper-button
            title="Export results"
            class="primary export-res-btn"
            ?hidden="${!this.showExportResults(this.interventionStatus, this.resultLinks)}"
            @tap="${this.exportExpectedResults}"
          >
            Export
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
            Show Inactive
          </paper-toggle-button>

          <div
            class="view-toggle-button layout-horizontal align-items-center"
            ?active="${this.showIndicators && !this.showActivities}"
            @click="${() => this.updateTableView(true, false)}"
          >
            Result view
          </div>
          <div
            class="view-toggle-button layout-horizontal align-items-center"
            ?active="${this.showIndicators && this.showActivities}"
            @click="${() => this.updateTableView(true, true)}"
          >
            Combined view
          </div>
          <div
            class="view-toggle-button layout-horizontal align-items-center"
            ?active="${!this.showIndicators && this.showActivities}"
            @click="${() => this.updateTableView(false, true)}"
          >
            Budget view
          </div>
          <iron-icon
            icon="add-box"
            ?hidden="${!this.isUnicefUser || !this.permissions.edit.result_links}"
            @click="${() => this.openCpOutputDialog()}"
          ></iron-icon>
        </div>
        ${this.resultLinks.map(
          (result: ExpectedResult) => html`
            <cp-output-level
              ?show-cpo-level="${this.isUnicefUser}"
              .resultLink="${result}"
              .interventionId="${this.interventionId}"
              .showIndicators="${this.showIndicators}"
              .showActivities="${this.showActivities}"
              @add-pd="${() => this.openPdOutputDialog({}, result.cp_output, result.cp_output_name)}"
              @edit-indicators="${() => this.openCpOutputDialog(result)}"
            >
              ${result.ll_results.map(
                (pdOutput: ResultLinkLowerResult) => html`
                  <etools-data-table-row class="pdOtputMargin">
                    <div slot="row-data" class="layout-horizontal align-items-center editable-row">
                      <div class="flex-1 flex-fix">
                        <div class="heading">Program Document output</div>
                        <div class="data bold-data">${pdOutput.name}</div>
                      </div>

                      <div class="flex-none" ?hidden="${!this.showActivities}">
                        <div class="heading">Total Cache budget</div>
                        <div class="data">TTT 1231.144</div>
                      </div>

                      <div class="hover-block">
                        <paper-icon-button
                          icon="icons:create"
                          ?hidden="${!this.permissions.edit.result_links}"
                          @tap="${() => this.openPdOutputDialog(pdOutput, result.cp_output, result.cp_output_name)}"
                        ></paper-icon-button>
                      </div>
                    </div>

                    <div slot="row-data-details">
                      <pd-indicators
                        ?hidden="${!this.showIndicators}"
                        .indicators="${pdOutput.applied_indicators}"
                        .pdOutputId="${pdOutput.id}"
                        .readonly="${!this.permissions.edit.result_links}"
                        .showInactiveIndicators="${this.showInactiveIndicators}"
                      ></pd-indicators>
                      <pd-activities
                        .activities="${pdOutput.activities}"
                        .interventionId="${this.interventionId}"
                        .pdOutputId="${pdOutput.id}"
                        .quarters="${this.quarters}"
                        ?hidden="${!this.showActivities}"
                        .readonly="${!this.permissions.edit.result_links}"
                      ></pd-activities>
                    </div>
                  </etools-data-table-row>
                `
              )}
            </cp-output-level>
          `
        )}
        ${!this.resultLinks.length ? html` <div class="no-results">There are no results added.</div> ` : ''}

        <div
          ?hidden="${this.isUnicefUser}"
          class="add-pd white row-h align-items-center"
          @click="${() => this.openPdOutputDialog()}"
        >
          <iron-icon icon="add-box"></iron-icon>Add PD Output
        </div>
      </etools-content-panel>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    // TODO: Remove test code for comments dialog
    // getStore()
    //   .dispatch(getComments(9))
    //   .then(() => {
    //     openDialog({
    //       dialog: 'comments-dialog',
    //       dialogData: {
    //         interventionId: 9,
    //         relatedTo: 'test',
    //         relatedToDescription: 'Test Data'
    //       }
    //     });
    //   });
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
    this.isUnicefUser = state.user?.data?.is_unicef_user;
    this._updateNoOfPdOutputs();
  }

  updateTableView(indicators: boolean, activities: boolean): void {
    this.showIndicators = indicators;
    this.showActivities = activities;
  }

  openPdOutputDialog(): void;
  openPdOutputDialog(pdOutput: Partial<ResultLinkLowerResult>, cpOutput: number, cpoName: string): void;
  openPdOutputDialog(pdOutput?: Partial<ResultLinkLowerResult>, cpOutput?: number, cpoName?: string): void {
    const currentOutputExists = Boolean(this.cpOutputs.find(({id}: CpOutput) => id === cpOutput));
    const cpOutputs: CpOutput[] = currentOutputExists
      ? this.cpOutputs
      : [{id: cpOutput, name: cpoName} as CpOutput, ...this.cpOutputs];
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

  openCpOutputDialog(resultLink?: ExpectedResult): void {
    const existedCpOutputs = new Set(this.resultLinks.map(({cp_output}: ExpectedResult) => cp_output));
    openDialog({
      dialog: 'cp-output-dialog',
      dialogData: {
        resultLink,
        cpOutputs: this.cpOutputs.filter(({id}: CpOutput) => !existedCpOutputs.has(id)),
        interventionId: this.interventionId
      }
    });
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
