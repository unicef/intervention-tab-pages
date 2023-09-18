import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {EditorTableStyles} from './editor-utils/editor-table-styles';
import '@polymer/iron-icons';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {TABS} from '../common/constants';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {
  selectInterventionId,
  selectInterventionQuarters,
  selectInterventionStatus
} from '../intervention-workplan/results-structure/results-structure.selectors';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import {currentIntervention, currentInterventionPermissions, isUnicefUser} from '../common/selectors';
import {ExpectedResult, Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import {InterventionQuarter} from '@unicef-polymer/etools-types/dist/intervention.types';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {repeat} from 'lit/directives/repeat.js';
import {displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../utils/intervention-endpoints';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {getIntervention, updateCurrentIntervention} from '../common/actions/interventions';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {ActivitiesMixin} from './editor-utils/activities-mixin';
import {ProgrammeManagementMixin} from './editor-utils/programme-management-mixin';
import {CommentsMixin} from '../common/components/comments/comments-mixin';
import {ExpectedResultExtended, ResultLinkLowerResultExtended} from '../common/types/editor-page-types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {translate} from 'lit-translate';
import {AsyncAction, EtoolsEndpoint, IdAndName} from '@unicef-polymer/etools-types';
import {EditorTableArrowKeysStyles} from './editor-utils/editor-table-arrow-keys-styles';
import {ArrowsNavigationMixin} from './editor-utils/arrows-navigation-mixin';
import {RootState} from '../common/types/store.types';
import {EditorHoverStyles} from './editor-utils/editor-hover-styles';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@polymer/paper-tooltip/paper-tooltip';
import {ifDefined} from 'lit/directives/if-defined.js';
/* eslint-disable max-len */
import {selectProgrammeManagement} from '../intervention-workplan/effective-efficient-programme-mgmt/effectiveEfficientProgrammeMgmt.selectors';
import {ActivitiesFocusMixin} from './editor-utils/activities-focus-mixin';
import {_canDelete} from '../common/mixins/results-structure-common';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
@customElement('editor-table')
// @ts-ignore
export class EditorTable extends CommentsMixin(
  ProgrammeManagementMixin(ActivitiesMixin(ActivitiesFocusMixin(ArrowsNavigationMixin(LitElement))))
) {
  static get styles() {
    return [EditorTableStyles, EditorTableArrowKeysStyles, EditorHoverStyles, buttonsStyles, ...super.styles];
  }
  render() {
    if (!this.intervention) {
      return html``;
    }

    return html`
      ${sharedStyles}
      <style>
        :host {
          --paper-tooltip: {
            font-size: 12px;
          }
        }
        paper-textarea {
          outline: none;
          flex: auto;
          --paper-input-container-input: {
            display: block;
            text-overflow: hidden;
          }

          --iron-autogrow-textarea: {
            overflow: auto;
            padding: 0;
            max-height: 96px;
            font-weight: bold;
          }
          --paper-input-container-label-floating_-_font-weight: 600;
          --paper-font-subhead_-_font-weight: 600;
          --paper-input-container-label-floating: {
            font-weight: 600;
          }
        }

        etools-input,
        etools-textarea {
          --etools-input-padding-top: 0;
          --etools-input-padding-bottom: 8px;
        }
        etools-input[total] {
          --etools-input-padding-top: 8px;
        }
        etools-input[total]::part(input) {
          text-align: right;
        }

        etools-textarea.other {
          --etools-input-padding-bottom: 16px;
        }
        .activity-items-row paper-textarea {
          --iron-autogrow-textarea_-_font-weight: 400;
        }
        .activity-items-row paper-input.bold {
          --paper-input-container-input: {
            font-weight: bold;
          }
        }

        .index-column {
          padding-top: 0;

          --paper-input-container-input: {
            font-size: 14px !important;
          }
        }

        .char-counter {
          display: flex;
        }

        .truncate-multi-line {
          margin: 4px 0 5px 0;
          max-height: 96px;
          line-height: 24px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
        }
        .truncate-single-line {
          max-height: 42px;
          line-height: 42px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          word-break: break-word;
        }
        .v-middle {
          vertical-align: middle;
        }

        etools-textarea::part(textarea) {
          padding-top: 2px;
          padding-bottom: 2px;
          max-height: 96px;
          overflow-y: auto;
        }
        etools-textarea::part(base),
        etools-input::part(base) {
          line-height: 24px;
        }
        etools-input::part(input) {
          line-height: 24px;
        }
        sl-icon-button[name='trash-fill'],
        sl-icon-button[name='pencil-fill'] {
          stroke: inherit;
        }
      </style>
      <table>
        <tbody>
          <tr class="row-for-fixed-table-layout">
            <td class="first-col"></td>
            <td class="col-text"></td>
            <td class="col-unit"></td>
            <td class="col-unit-no"></td>
            <td class="col-p-per-unit"></td>
            <td class="col-g"></td>
            <td class="col-g"></td>
            <td class="col-g" colspan="2"></td>
          </tr>
        </tbody>
        ${this.isUnicefUser || !this.permissions?.edit.result_links || this.commentMode
          ? html``
          : html`
              <tbody
                ?hoverable="${this.permissions?.edit.result_links &&
                !this.commentMode &&
                !this.isUnicefUser &&
                !this.oneEntityInEditMode}"
              >
                <tr
                  class="add action-btns heavy-blue"
                  type="cp-output"
                  ?hidden="${this.isUnicefUser || !this.permissions?.edit.result_links || this.commentMode}"
                >
                  <td></td>
                  <td colspan="3" class="v-middle">${translate('ADD_PD_OUTPUT')}</td>
                  <td colspan="3"></td>
                  <td colspan="2" tabindex="${ifDefined(this.commentMode ? undefined : 0)}">
                    <div class="action-btns" style="position:relative">
                      <sl-icon-button
                        id="add-pd-output"
                        @click="${(e: any) => {
                          this.addNewUnassignedPDOutput();
                          this.moveFocusToNewllyAdded(e.target);
                        }}"
                        ?hidden="${!this.permissions?.edit.result_links}"
                        name="plus-square-fill"
                        tabindex="0"
                      ></sl-icon-button>

                      <paper-tooltip
                        for="add-pd-output"
                        .animationDelay="${0}"
                        .animationConfig="${{}}"
                        animation-entry=""
                        animation-exit=""
                        ?hide-tooltip="${!this.permissions?.edit.result_links}"
                        position="top"
                      >
                        ${translate('ADD_PD_OUTPUT')}
                      </paper-tooltip>
                    </div>
                  </td>
                </tr>
              </tbody>
            `}
        ${repeat(
          this.resultStructureDetails,
          (result: ExpectedResult) => result.id,
          (result, resultIndex) => html`
            <tbody
              ?hoverable="${this.permissions?.edit.result_links && !this.commentMode && !this.oneEntityInEditMode}"
              ?hidden="${!this.isUnicefUser}"
              class="heavy-blue"
            >
              <tr class="header">
                <td>${translate('ID')}</td>
                <td colspan="3">${translate('COUNTRY_PROGRAME_OUTPUT')}</td>
                <td colspan="3"></td>
                <td colspan="2">${translate('TOTAL')}</td>
              </tr>
              <tr class="text no-b-border">
                <td class="index-column">
                  <etools-input
                    title="${result.code}"
                    no-label-float
                    readonly
                    tabindex="-1"
                    .value="${result.code}"
                  ></etools-input>
                </td>
                <td colspan="3" class="${result.cp_output_name ? 'b' : 'red'}">
                  ${result.cp_output_name || translate('UNASSOCIATED_TO_CP_OUTPUT')}
                </td>
                <td colspan="3"></td>
                <td colspan="2">
                  ${this.intervention.planned_budget.currency}
                  <span class="b">${displayCurrencyAmount(result.total, '0.00')}</span>
                </td>
              </tr>
              <tr class="add action-btns" type="cp-output">
                <td></td>
                <td colspan="3"></td>
                <td colspan="3"></td>
                <td
                  colspan="2"
                  class="action-btns"
                  tabindex="${ifDefined(
                    !this.permissions?.edit.result_links ||
                      !this.getOriginalCPOutput(resultIndex)?.cp_output ||
                      this.commentMode
                      ? undefined
                      : '0'
                  )}"
                >
                  <div class="action-btns" style="position:relative">
                    <sl-icon-button
                      id="add-pd-output-${result.id}"
                      slot="custom-icon"
                      @click="${(e: any) => {
                        this.addNewPDOutput(result.ll_results);
                        this.moveFocusToNewllyAdded(e.target);
                      }}"
                      ?hidden="${!this.permissions?.edit.result_links ||
                      !this.getOriginalCPOutput(resultIndex)?.cp_output}"
                      name="plus-square-fill"
                      tabindex="0"
                    ></sl-icon-button>
                    <paper-tooltip
                      for="add-pd-output-${result.id}"
                      .animationDelay="${0}"
                      .animationConfig="${{}}"
                      animation-entry=""
                      animation-exit=""
                      ?hidden="${!this.permissions?.edit.result_links}"
                      position="top"
                      offset="1"
                    >
                      ${translate('ADD_PD_OUTPUT')}
                    </paper-tooltip>
                  </div>
                </td>
              </tr>
            </tbody>
            ${repeat(
              result.ll_results,
              (pdOutput: ResultLinkLowerResultExtended) => pdOutput.id,
              (pdOutput: ResultLinkLowerResultExtended, pdOutputIndex) => html`
                <tbody
                  ?hoverable="${!pdOutput.inEditMode &&
                  this.permissions?.edit.result_links &&
                  !this.commentMode &&
                  !this.oneEntityInEditMode}"
                  class="lighter-blue"
                  comment-element="pd-output-${pdOutput.id}"
                  comment-description="${pdOutput.name}"
                >
                  <tr class="header">
                    <td></td>
                    <td colspan="3">${translate('PD_OUTPUT')}</td>
                    <td colspan="3"></td>
                    <td colspan="2">${translate('TOTAL')}</td>
                  </tr>
                  <tr
                    class="text action-btns  ${this.permissions?.edit.result_links ? 'height-for-action-btns' : ''}"
                    type="pd-output"
                  >
                    <td class="index-column">
                      <etools-input
                        title="${pdOutput.code}"
                        no-label-float
                        readonly
                        tabindex="-1"
                        .value="${pdOutput.code}"
                      ></etools-input>
                    </td>
                    <td colspan="3" class="b no-top-padding" tabindex="${ifDefined(this.commentMode ? undefined : 0)}">
                      <etools-textarea
                        no-label-float
                        class="bold"
                        input
                        .value="${pdOutput.name}"
                        ?hidden="${!pdOutput.inEditMode}"
                        char-counter
                        maxlength="500"
                        .autoValidate="${this.autovalidatePdOutput}"
                        required
                        .invalid="${pdOutput.invalid}"
                        error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                        @keydown="${(e: any) => {
                          if (
                            pdOutput.inEditMode &&
                            ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
                          ) {
                            e.stopImmediatePropagation();
                          }
                          this.handleEsc(e);
                        }}"
                        @focus="${() => (this.autovalidatePdOutput = true)}"
                        @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'name', pdOutput)}"
                      ></etools-textarea>
                      <div class="bold truncate-multi-line" title="${pdOutput.name}" ?hidden="${pdOutput.inEditMode}">
                        ${pdOutput.name}
                      </div>
                      ${this.showCpOutput(this.isUnicefUser, this.getOriginalCPOutput(resultIndex))
                        ? html`<div class="pad-top-8 space-for-err-msg">
                            <etools-dropdown
                              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                                this.unassignedPDMap.set(pdOutput.id, detail.selectedItem && detail.selectedItem.id);
                                this.requestUpdate();
                              }}"
                              label="CP Output"
                              .selected="${this.unassignedPDMap.get(pdOutput.id) || null}"
                              placeholder="&#8212;"
                              .options="${this.cpOutputs}"
                              option-label="name"
                              option-value="id"
                              auto-validate
                              required
                              trigger-value-change-event
                              ?readonly="${!pdOutput.inEditMode}"
                              ?invalid="${pdOutput.invalidCpOutput}"
                              .errorMessage="${translate('GENERAL.REQUIRED_FIELD')}"
                            ></etools-dropdown>
                          </div>`
                        : ''}
                    </td>
                    <td colspan="3"></td>
                    <td
                      colspan="2"
                      class="action-btns"
                      style="position:relative;"
                      tabindex="${ifDefined(this.commentMode || !this.permissions?.edit.result_links ? undefined : 0)}"
                    >
                      <div>
                        ${this.intervention.planned_budget.currency}
                        <span class="b">${displayCurrencyAmount(pdOutput.total, '0.00')}</span>
                      </div>
                      <div class="action-btns align-bottom flex-h action-btns">
                        <sl-icon-button
                          name="pencil-fill"
                          ?hidden="${pdOutput.inEditMode || !this.permissions?.edit.result_links}"
                          @click="${(e: any) => {
                            pdOutput.inEditMode = true;
                            this.oneEntityInEditMode = true;
                            this.requestUpdate();
                            this.moveFocusToFirstInput(e.target);
                          }}"
                        ></sl-icon-button>

                        <sl-icon-button
                          id="add-a-${pdOutput.id}"
                          name="plus-square-fill"
                          slot="custom-icon"
                          @click="${(e: any) => {
                            this.addNewActivity(pdOutput);
                            this.moveFocusToNewllyAdded(e.target);
                          }}"
                          ?hidden="${pdOutput.inEditMode || !this.permissions?.edit.result_links}"
                        ></sl-icon-button>
                        <paper-tooltip
                          for="add-a-${pdOutput.id}"
                          .animationDelay="${0}"
                          .animationConfig="${{}}"
                          animation-entry=""
                          animation-exit=""
                          ?hidden="${!this.permissions?.edit.result_links}"
                          position="top"
                          offset="1"
                        >
                          ${translate('ADD_NEW_ACTIVITY')}
                        </paper-tooltip>
                        <sl-icon-button
                          name="trash-fill"
                          ?hidden="${pdOutput.inEditMode ||
                          !_canDelete(
                            pdOutput,
                            !this.permissions?.edit.result_links!,
                            this.intervention.status,
                            this.intervention.in_amendment,
                            this.intervention.in_amendment_date
                          )}"
                          @click="${() => this.openDeletePdOutputDialog(pdOutput.id)}"
                        ></sl-icon-button>
                      </div>
                      <div class="flex-h justify-right align-bottom" ?hidden="${!pdOutput.inEditMode}">
                        <sl-button
                          id="btnSave"
                          variant="primary"
                          class="primary-btn"
                          @click="${() => this.savePdOutput(pdOutput, result)}"
                          ?hidden="${!pdOutput.inEditMode}"
                          >${translate('GENERAL.SAVE')}</sl-button
                        >
                        <sl-icon-button
                          name="x-lg"
                          @click="${() => this.cancelPdOutput(result, pdOutput, resultIndex, pdOutputIndex)}"
                        ></sl-icon-button>
                      </div>
                    </td>
                  </tr>
                </tbody>
                ${this.renderActivities(pdOutput, resultIndex, pdOutputIndex)}
              `
            )}
          `
        )}
        ${this.renderProgrammeManagement()}
      </table>
    `;
  }

  @property({type: Array})
  resultStructureDetails: ExpectedResultExtended[] = [];

  @property() interventionId!: number | null;
  @property() interventionStatus!: string;

  quarters: InterventionQuarter[] = [];
  originalResultStructureDetails: ExpectedResultExtended[] = [];

  @property({type: Boolean}) isUnicefUser = true;
  @property({type: Object})
  permissions!: {
    edit: {
      result_links?: boolean;
      management_budgets?: boolean;
    };
    required: {
      result_links?: boolean;
      management_budgets?: boolean;
    };
  };

  @property({type: Object})
  intervention!: Intervention;

  @property({type: Object})
  originalIntervention!: Intervention;

  @property({type: Boolean})
  readonly = false;

  @property() cpOutputs: {id: number; name: string}[] = [];

  @property({type: Boolean})
  autovalidatePdOutput = false;

  @property({type: Boolean})
  oneEntityInEditMode = false;

  // we need to track changes to unassigned PD separately (pd_id -> cp_id),
  // because all unassigned PDs have one common parent object and we can not change result.cp_output directly
  unassignedPDMap: Map<number, number> = new Map();

  private refreshResultStructure = false;
  private resultStructureIsLoaded = false;
  private prevInterventionId: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => {
      this.addArrowNavListener();
      this.focusFirstTd();
    }, 2000);
  }

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(state.app?.routeDetails, 'interventions', TABS.WorkplanEditor)) {
      this.prevInterventionId = null;
      this.oneEntityInEditMode = false;
      if (!state.commentsData.commentsModeEnabled) {
        // reset comments border on leave page to not have a flash on come back
        super.stateChanged(state);
      }
      return;
    }
    if (!selectInterventionId(state)) {
      return;
    }
    if (!this.prevInterventionId) {
      fireEvent(this, 'toggle-small-menu', {value: true});
    }
    this.interventionId = selectInterventionId(state);
    this.permissions = cloneDeep(currentInterventionPermissions(state));
    this.interventionStatus = selectInterventionStatus(state);
    this.quarters = selectInterventionQuarters(state);
    this.isUnicefUser = isUnicefUser(state);
    this.intervention = cloneDeep(currentIntervention(state));
    if (!isJsonStrMatch(this.originalProgMgmt, selectProgrammeManagement(state))) {
      this.originalProgMgmt = selectProgrammeManagement(state);
      this.formattedProgrammeManagement = this.formatProgrammeManagement(selectProgrammeManagement(state));
      this.originalFormattedProgrammeManagement = cloneDeep(this.formattedProgrammeManagement);
    }

    this.cpOutputs = this.intervention.result_links
      .map(({cp_output: id, cp_output_name: name}: ExpectedResult) => ({
        id,
        name
      }))
      .filter(({id}: IdAndName<number>) => id);

    if (!this.originalIntervention) {
      this.originalIntervention = cloneDeep(this.intervention);
    } else if (!isJsonStrMatch(this.originalIntervention, this.intervention)) {
      this.originalIntervention = cloneDeep(this.intervention);
      // intervention changed, need to reload ResultLinks
      this.refreshResultStructure = true;
    }

    if (this.prevInterventionId != selectInterventionId(state) || this.refreshResultStructure) {
      // Avoid console errors
      this.autovalidatePdOutput = false;
      this.autoValidateActivityName = false;

      this.getResultLinksDetails().then(() => {
        if (!this.refreshResultStructure) {
          if (
            this.permissions?.edit?.result_links &&
            this.resultStructureDetails &&
            this.resultStructureDetails.length &&
            !this.commentMode
          ) {
            this.addCtrlSListener();
          } else {
            this.removeCtrlSListener();
          }
        }
        this.resultStructureIsLoaded = true;
      });

      this.prevInterventionId = this.interventionId;
      this.refreshResultStructure = false;
    }

    // On page refresh apply comment mode after components are rendered
    this.waitForResultsStructureToLoad().then(() => this.updateComplete.then(() => super.stateChanged(state)));

    if (this.lastFocusedTd) {
      this.lastFocusedTd.focus();
    }
  }

  waitForResultsStructureToLoad() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.resultStructureIsLoaded) {
          clearInterval(interval);
          resolve(true);
        }
      }, 200);
    });
  }

  getResultLinksDetails() {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: this.localName
    });
    this.resultStructureIsLoaded = false;
    return sendRequest({
      endpoint: getEndpoint(interventionEndpoints.resultLinksDetails, {id: this.intervention.id})
    }).then((response: any) => {
      this.resultStructureDetails = response.result_links;
      this.originalResultStructureDetails = cloneDeep(this.resultStructureDetails);
      this.requestUpdate();
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: this.localName
      });
    });
  }

  showCpOutput(isUnicefUsr: boolean, result?: ExpectedResultExtended) {
    // show only for Unicef users and if cp_output wasn't assigned
    return isUnicefUsr && !result?.cp_output;
  }

  addNewPDOutput(llResults: Partial<ResultLinkLowerResultExtended>[]) {
    if (!llResults.find((ll) => !ll.id)) {
      llResults.unshift({name: '', total: '0', inEditMode: true});
      this.oneEntityInEditMode = true;
      this.requestUpdate();
    }
  }

  addNewUnassignedPDOutput() {
    if (!this.resultStructureDetails.some((r) => !r.cp_output && r.ll_results.some((pdO) => !pdO.id))) {
      this.resultStructureDetails.unshift({
        // @ts-ignore
        cp_output: null,
        intervention: this.interventionId!,
        // @ts-ignore
        ll_results: [{name: '', total: '0', inEditMode: true}],
        total: '0'
      });
      this.oneEntityInEditMode = true;
      this.requestUpdate();
    }
  }

  addNewActivity(pdOutput: Partial<ResultLinkLowerResultExtended>) {
    if (!pdOutput.activities?.find((a) => !a.id)) {
      // @ts-ignore
      pdOutput.activities?.unshift({name: '', total: '0', time_frames: [], inEditMode: true});
      this.oneEntityInEditMode = true;
      this.requestUpdate();
    }
  }

  savePdOutput(pdOutput: ResultLinkLowerResultExtended, cpOutput: ExpectedResult) {
    const cpOutputId: number | null = cpOutput.cp_output || this.unassignedPDMap.get(pdOutput.id) || null;
    if (!this.validatePdOutput(pdOutput, cpOutputId)) {
      this.requestUpdate();
      return;
    }

    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: this.localName
    });

    const endpoint: EtoolsRequestEndpoint = pdOutput.id
      ? getEndpoint(interventionEndpoints.pdOutputDetails, {pd_id: pdOutput.id, intervention_id: this.interventionId})
      : getEndpoint(interventionEndpoints.createPdOutput, {intervention_id: this.interventionId});

    sendRequest({
      endpoint,
      method: pdOutput.id ? 'PATCH' : 'POST',
      body: this.getBody(pdOutput, cpOutputId)
    })
      .then((response) => {
        this.refreshResultStructure = true;
        this.oneEntityInEditMode = false;
        getStore().dispatch(updateCurrentIntervention(response.intervention));
        // erase collection because now we discard all changes for other items that was in edit mode
        this.unassignedPDMap.clear();
      })
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

  getBody(pdOutput: ResultLinkLowerResultExtended, cpOutputId: number | null) {
    let body: any = {name: pdOutput.name};
    if (pdOutput.id) {
      body = {...body, id: pdOutput.id};
    }
    if (cpOutputId) {
      body = {...body, cp_output: cpOutputId};
    }
    return body;
  }

  validatePdOutput(pdOutput: ResultLinkLowerResultExtended, cpOutputId: number | null) {
    let valid = true;
    if (!pdOutput.name) {
      pdOutput.invalid = true;
      valid = false;
    }
    if (!cpOutputId && this.isUnicefUser) {
      pdOutput.invalidCpOutput = true;
      valid = false;
    }
    return valid;
  }

  cancelPdOutput(
    result: ExpectedResultExtended,
    pdOutput: ResultLinkLowerResultExtended,
    resultIndex: number,
    pdOutputIndex: number
  ) {
    if (!pdOutput.id) {
      result.ll_results.shift();
    } else {
      pdOutput.name = this.getOriginalPDOutput(resultIndex, pdOutputIndex).name;
      if (this.isUnicefUser && !this.getOriginalCPOutput(resultIndex)?.cp_output) {
        this.unassignedPDMap.delete(pdOutput.id);
      }
    }
    pdOutput.invalid = false;
    pdOutput.invalidCpOutput = false;
    pdOutput.inEditMode = false;
    this.oneEntityInEditMode = false;

    this.requestUpdate();
    this.lastFocusedTd.focus();
  }

  getOriginalPDOutput(resultIndex: number, pdOutputIndex: number) {
    // Covers case when a new PD Output is added while the cancelled one is already in edit mode,
    // thus changing the index
    let originalPdOutputIndex = pdOutputIndex;

    if (this.resultStructureDetails[resultIndex].ll_results.find((pdOutput) => !pdOutput.id)) {
      originalPdOutputIndex = originalPdOutputIndex - 1;
    }
    return this.originalResultStructureDetails[resultIndex].ll_results[originalPdOutputIndex];
  }

  getOriginalCPOutput(resultIndex: number) {
    // Covers case when a new PD Output is added and index changes
    let originalResIndex = resultIndex;

    if (!this.originalResultStructureDetails[resultIndex]) {
      if (resultIndex == 0) {
        return undefined;
      }
      originalResIndex = resultIndex - 1;
    }
    return this.originalResultStructureDetails[originalResIndex];
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
      loadingSource: 'interv-pdoutput-remove'
    });
    const endpoint = getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(interventionEndpoints.lowerResultsDelete, {
      lower_result_id,
      intervention_id: this.interventionId
    });
    sendRequest({
      method: 'DELETE',
      endpoint: endpoint
    })
      .then(() => {
        this.getResultLinksDetails();
        getStore().dispatch<AsyncAction>(getIntervention());
      })
      .finally(() =>
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'interv-pdoutput-remove'
        })
      );
  }
}
