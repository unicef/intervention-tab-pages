import {customElement, html, LitElement, property} from 'lit-element';
import {EditorTableStyles} from './editor-utils/editor-table-styles';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons';
import '@polymer/paper-input/paper-textarea';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {TABS} from '../common/constants';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {
  selectInterventionId,
  selectInterventionQuarters,
  selectInterventionStatus
} from '../intervention-workplan/results-structure/results-structure.selectors';
import {currentIntervention, currentInterventionPermissions, isUnicefUser} from '../common/selectors';
import {ExpectedResult, Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import {InterventionQuarter} from '@unicef-polymer/etools-types/dist/intervention.types';
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
import {getIntervention, updateCurrentIntervention} from '../common/actions/interventions';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {ActivitiesMixin} from './editor-utils/activities-mixin';
import {ProgrammeManagementMixin} from './editor-utils/programme-management-mixin';
import {CommentsMixin} from '../common/components/comments/comments-mixin';
import {ExpectedResultExtended, ResultLinkLowerResultExtended} from './editor-utils/types';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {translate} from 'lit-translate';
import {AsyncAction, IdAndName} from '@unicef-polymer/etools-types';
import {EditorTableArrowKeysStyles} from './editor-utils/editor-table-arrow-keys-styles';
import {ArrowsNavigationMixin} from './editor-utils/arrows-navigation-mixin';
import {RootState} from '../common/types/store.types';
import {EditorHoverStyles} from './editor-utils/editor-hover-styles';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import {updateSmallMenu} from '../common/actions/common-actions';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
/* eslint-disable max-len */
import {selectProgrammeManagement} from '../intervention-workplan/effective-efficient-programme-mgmt/effectiveEfficientProgrammeMgmt.selectors';
@customElement('editor-table')
// @ts-ignore
export class EditorTable extends CommentsMixin(
  ProgrammeManagementMixin(ActivitiesMixin(ArrowsNavigationMixin(LitElement)))
) {
  static get styles() {
    return [EditorTableStyles, EditorTableArrowKeysStyles, EditorHoverStyles, ...super.styles];
  }
  render() {
    if (!this.intervention) {
      return html``;
    }

    return html`
      ${sharedStyles}
      <style>
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
        paper-textarea[readonly] {
          --iron-autogrow-textarea_-_overflow: hidden;
        }
        paper-textarea.bold {
          --iron-autogrow-textarea_-_font-weight: bold;
        }
        paper-textarea.other[readonly] {
          --iron-autogrow-textarea_-_font-weight: 400;
          --iron-autogrow-textarea_-_overflow: hidden;
          --iron-autogrow-textarea_-_max-height: 21px;
        }
        paper-textarea.other {
          --iron-autogrow-textarea_-_font-weight: 400;
          --iron-autogrow-textarea_-_max-height: 96px;
          --paper-input-container-label-floating_-_color: var(--secondary-text-color);
        }
        .activity-items-row paper-textarea {
          --iron-autogrow-textarea_-_font-weight: 400;
        }
        .activity-items-row paper-input.bold {
          --paper-input-container-input: {
            font-weight: bold;
          }
        }
        .char-counter {
          margin-bottom: -12px;
          display: flex;
        }

        .truncate-multi-line {
          margin: 8px 0 10px 0;
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
        ${this.renderProgrammeManagement()}
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
                  <td colspan="3"></td>
                  <td colspan="3"></td>
                  <td colspan="2" tabindex="0">
                    <div class="action-btns" style="position:relative">
                      <etools-info-tooltip
                        position="top"
                        offset="0"
                        custom-icon
                        ?hide-tooltip="${!this.permissions?.edit.result_links}"
                        style="justify-content:end;"
                      >
                        <paper-icon-button
                          id="add-pd-output"
                          slot="custom-icon"
                          @click="${(e: any) => {
                            this.addNewUnassignedPDOutput();
                            this.moveFocusToNewllyAdded(e.target);
                          }}"
                          ?hidden="${!this.permissions?.edit.result_links}"
                          icon="add-box"
                          tabindex="0"
                        ></paper-icon-button>
                        <span class="no-wrap" slot="message">${translate('ADD_PD_OUTPUT')}</span>
                      </etools-info-tooltip>
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
                <td>${result.code}</td>
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
                  tabindex="${!this.permissions?.edit.result_links || !this.getOriginalCPOutput(resultIndex)?.cp_output
                    ? '-1'
                    : '0'}"
                >
                  <div class="action-btns" style="position:relative">
                    <etools-info-tooltip
                      position="top"
                      offset="0"
                      custom-icon
                      ?hide-tooltip="${!this.permissions?.edit.result_links}"
                      style="justify-content:end;"
                    >
                      <paper-icon-button
                        id="add-pd-output-${result.id}"
                        slot="custom-icon"
                        @click="${(e: any) => {
                          this.addNewPDOutput(result.ll_results);
                          this.moveFocusToNewllyAdded(e.target);
                        }}"
                        ?hidden="${!this.permissions?.edit.result_links ||
                        !this.getOriginalCPOutput(resultIndex)?.cp_output}"
                        icon="add-box"
                        tabindex="0"
                      ></paper-icon-button>
                      <span class="no-wrap" slot="message">${translate('ADD_PD_OUTPUT')}</span>
                    </etools-info-tooltip>
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
                  comment-description=" PD Output - ${pdOutput.name}"
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
                    <td class="padd-top-10">${pdOutput.code}</td>
                    <td colspan="3" class="b no-top-padding" tabindex="0">
                      <paper-textarea
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
                        @value-changed="${({detail}: CustomEvent) =>
                          this.updateModelValue(pdOutput, 'name', detail.value)}"
                      ></paper-textarea>
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
                      tabindex="${!this.permissions?.edit.result_links ? '-1' : '0'}"
                    >
                      <div>
                        ${this.intervention.planned_budget.currency}
                        <span class="b">${displayCurrencyAmount(pdOutput.total, '0.00')}</span>
                      </div>
                      <div class="action-btns align-bottom flex-h action-btns">
                        <paper-icon-button
                          icon="create"
                          ?hidden="${pdOutput.inEditMode || !this.permissions?.edit.result_links}"
                          @click="${(e: any) => {
                            pdOutput.inEditMode = true;
                            this.oneEntityInEditMode = true;
                            this.requestUpdate();
                            this.moveFocusToFirstInput(e.target);
                          }}"
                        ></paper-icon-button>
                        <etools-info-tooltip
                          position="top"
                          offset="0"
                          custom-icon
                          ?hide-tooltip="${!this.permissions?.edit.result_links}"
                          style="justify-content:end;"
                        >
                          <paper-icon-button
                            icon="add-box"
                            slot="custom-icon"
                            @click="${(e: any) => {
                              this.addNewActivity(pdOutput);
                              this.moveFocusToNewllyAdded(e.target);
                            }}"
                            ?hidden="${pdOutput.inEditMode || !this.permissions?.edit.result_links}"
                          ></paper-icon-button>
                          <span class="no-wrap" slot="message">${translate('ADD_NEW_ACTIVITY')}</span>
                        </etools-info-tooltip>
                        <paper-icon-button
                          icon="delete"
                          ?hidden="${pdOutput.inEditMode || !this.permissions?.edit.result_links}"
                          @click="${() => this.openDeletePdOutputDialog(pdOutput.id)}"
                        ></paper-icon-button>
                      </div>
                      <div class="flex-h justify-right align-bottom" ?hidden="${!pdOutput.inEditMode}">
                        <paper-button
                          id="btnSave"
                          @click="${() => this.savePdOutput(pdOutput, result)}"
                          ?hidden="${!pdOutput.inEditMode}"
                          >${translate('GENERAL.SAVE')}</paper-button
                        >
                        <paper-icon-button
                          icon="close"
                          @click="${() => this.cancelPdOutput(result, pdOutput, resultIndex, pdOutputIndex)}"
                        ></paper-icon-button>
                      </div>
                    </td>
                  </tr>
                </tbody>
                ${this.renderActivities(pdOutput, resultIndex, pdOutputIndex)}
              `
            )}
          `
        )}
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
  private prevInterventionId: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => {
      this.addArrowNavListener();
      this.focusFirstTd();
    }, 2000);
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(state.app?.routeDetails, 'interventions', TABS.WorkplanEditor)) {
      this.prevInterventionId = null;
      this.oneEntityInEditMode = false;
      return;
    }
    if (!selectInterventionId(state)) {
      return;
    }
    if (!state.app?.smallMenu && !this.prevInterventionId) {
      getStore().dispatch(updateSmallMenu(true));
    }
    this.interventionId = selectInterventionId(state);
    this.permissions = cloneDeep(currentInterventionPermissions(state));
    this.interventionStatus = selectInterventionStatus(state);
    this.quarters = selectInterventionQuarters(state);
    this.isUnicefUser = isUnicefUser(state);
    this.intervention = cloneDeep(currentIntervention(state));
    this.formattedProgrammeManagement = this.formatProgrammeManagement(selectProgrammeManagement(state));
    this.originalFormattedProgrammeManagement = cloneDeep(this.formattedProgrammeManagement);

    this.cpOutputs = this.intervention.result_links
      .map(({cp_output: id, cp_output_name: name}: ExpectedResult) => ({
        id,
        name
      }))
      .filter(({id}: IdAndName<number>) => id);

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
        // need to be sure that editor elements where rendered before calling setCommentMode
        // (ex: show comments border after page refresh)
        setTimeout(() => {
          this.setCommentMode();
        }, 500);
      });

      this.prevInterventionId = this.interventionId;
      this.refreshResultStructure = false;
    }
    super.stateChanged(state);

    if (this.lastFocusedTd) {
      this.lastFocusedTd.focus();
    }
  }

  getResultLinksDetails() {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: this.localName
    });
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
    const endpoint = getEndpoint(interventionEndpoints.lowerResultsDelete, {
      lower_result_id,
      intervention_id: this.interventionId
    });
    sendRequest({
      method: 'DELETE',
      endpoint: endpoint
    }).then(() => {
      this.getResultLinksDetails();
      getStore().dispatch<AsyncAction>(getIntervention());
    });
  }

  updateModelValue(model: any, property: string, newVal: any) {
    if (newVal == model[property]) {
      return;
    }
    model[property] = newVal;
    this.requestUpdate();
  }

  moveFocusToNewllyAdded(element: any) {
    const currTbody = this.determineParentTr(element).parentElement;
    setTimeout(() => {
      const targetTr = currTbody.nextElementSibling.querySelector('tr.text');
      const input = targetTr.querySelector('[input]');

      if (input) {
        this.lastFocusedTd = this.determineParentTd(input);
        if (!input.focused) {
          // Calling focus() when it's already focused it defocuses
          input.focus();
        }
      }

      // @ts-ignore Defined in arrows-nav-mixin
      this.attachListenersToTr(targetTr);
    });
  }
}
