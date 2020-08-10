import {getStore} from '../../utils/redux-store-access';
import {css, html, CSSResultArray, customElement, LitElement, property} from 'lit-element';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {
  selectInterventionId,
  selectInterventionQuarters,
  selectInterventionResultLinks
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
import './cp-output-level';
import './pd-indicators';
import './pd-activities';
import './modals/pd-output-dialog';
import {connect} from 'pwa-helpers/connect-mixin';
import {openDialog} from '../../utils/dialog';

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
      css`
        etools-content-panel {
          --ecp-content-padding: 0;
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
      `
    ];
  }
  get resultLinks(): ExpectedResult[] {
    return this._resultLinks || [];
  }
  set resultLinks(data: ExpectedResult[]) {
    this._resultLinks = data;
  }
  @property() interventionId!: number | null;
  quarters: InterventionQuarter[] = [];

  @property({type: Boolean}) isUnicefUser = true;
  @property({type: Boolean}) showIndicators = true;
  @property({type: Boolean}) showActivities = true;

  private cpOutputs: CpOutput[] = [];
  @property() private _resultLinks: ExpectedResult[] | null = [];

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
      </style>

      <etools-content-panel panel-title="Results Structure">
        <div slot="panel-btns" class="layout-horizontal align-items-center">
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
            >
              ${result.ll_results.map(
                (pdOutput: ResultLinkLowerResult) => html`
                  <etools-data-table-row>
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
                          @tap="${() => this.openPdOutputDialog(pdOutput, result.cp_output, result.cp_output_name)}"
                        ></paper-icon-button>
                      </div>
                    </div>

                    <div slot="row-data-details">
                      <pd-indicators
                        ?hidden="${!this.showIndicators}"
                        .indicators="${pdOutput.applied_indicators}"
                      ></pd-indicators>
                      <pd-activities
                        .activities="${pdOutput.activities}"
                        .interventionId="${this.interventionId}"
                        .pdOutputId="${pdOutput.id}"
                        .quarters="${this.quarters}"
                        ?hidden="${!this.showActivities}"
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
          ?hidden="${false}"
          class="add-pd white row-h align-items-center"
          @click="${() => this.openPdOutputDialog()}"
        >
          <iron-icon icon="add-box"></iron-icon>Add PD Output
        </div>
      </etools-content-panel>
    `;
  }

  stateChanged(state: any) {
    this.resultLinks = selectInterventionResultLinks(state);
    this.interventionId = selectInterventionId(state);
    this.quarters = selectInterventionQuarters(state);
    this.cpOutputs = (state.commonData && state.commonData.cpOutputs) || [];
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
}
